import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import {
	banner,
	bannerAbort,
	color,
	createContext,
	error,
	exec,
	getFriendlyName,
	getGitEmail,
	hasPackageJson,
	type InitContext,
	info,
	isEmpty,
	log,
	nextSteps,
	runTasks,
	scaffoldProject,
	toValidName,
	handleTextPrompt,
	handleSelectPrompt,
	handleConfirmPrompt,
	handlePasswordPrompt,
	validators,
} from "../utils/init";

export interface InitOptions {
	yes?: boolean;
	dryRun?: boolean;
	packageManager?: string;
	solutionsDir?: string;
	git?: boolean;
	install?: boolean;
}

async function isOnline(): Promise<boolean> {
	return dns.lookup("github.com").then(
		() => true,
		() => false,
	);
}

async function verifyNetwork(ctx: InitContext): Promise<void> {
	if (!ctx.dryRun) {
		const online = await isOnline();
		if (!online) {
			bannerAbort();
			log("");
			await error("error", "Unable to connect to the internet.");
			ctx.exit(1);
		}
	}
}

async function showIntro(): Promise<void> {
	const name = await getFriendlyName();
	banner(name);
}

async function showEnvironmentDetection(ctx: InitContext): Promise<void> {
	const cwdEmpty = isEmpty(ctx.cwd);
	const hasExistingPackage = hasPackageJson(ctx.cwd);

	log("");
	await info("Environment", "");

	if (hasExistingPackage) {
		await info("  Project", "Existing package.json detected");
	} else if (cwdEmpty) {
		await info("  Project", "Starting fresh in empty directory");
	} else {
		await info("  Project", "Non-empty directory (will prompt before overwriting)");
	}

	await info("  Package Manager", ctx.packageManager);
	await info("  Location", ctx.cwd);
	log("");
}

async function handleQuickVsFull(ctx: InitContext): Promise<void> {
	if (ctx.yes || ctx.dryRun) {
		ctx.quickMode = true;
		if (!ctx.dryRun) {
			await info("mode", "Quick setup (using defaults)");
		}
		return;
	}

	const choice = await handleSelectPrompt(
		{
			message: "Setup mode:",
			options: [
				{
					value: "quick",
					label: "Quick (~1 min) - sensible defaults, minimal questions",
				},
				{ value: "full", label: "Full - customize every aspect" },
			],
			initialValue: "quick",
		},
		() => ctx.exit(1),
	);

	ctx.quickMode = choice === "quick";
}

async function handlePackageManager(ctx: InitContext): Promise<void> {
	if (ctx.yes || ctx.quickMode) {
		await info("pm", ctx.packageManager);
		return;
	}

	ctx.packageManager = await handleSelectPrompt(
		{
			message: "Which package manager do you want to use?",
			options: [
				{ value: "npm", label: "npm" },
				{ value: "bun", label: "bun" },
				{ value: "yarn", label: "yarn" },
				{ value: "pnpm", label: "pnpm" },
			],
			initialValue: ctx.packageManager,
		},
		() => ctx.exit(1),
	);
}

async function handleProjectName(ctx: InitContext): Promise<void> {
	const cwdEmpty = isEmpty(ctx.cwd);
	const hasExistingPackage = hasPackageJson(ctx.cwd);

	if (!cwdEmpty && !hasExistingPackage) {
		await info(
			"Hmm...",
			`${color.reset(`"${ctx.cwd}"`)}${color.dim(" is not empty!")}`,
		);

		if (ctx.yes) {
			await error(
				"error",
				"Cannot initialize in non-empty directory without package.json. Please clear the directory or run in an empty one.",
			);
			ctx.exit(1);
		}

		const shouldClear = await handleConfirmPrompt(
			{
				message:
					"Directory is not empty. Would you like to continue anyway? (existing files may be overwritten)",
				initialValue: false,
			},
			() => ctx.exit(1),
		);

		if (!shouldClear) {
			ctx.exit(1);
		}
	}

	if (hasExistingPackage) {
		await info("Found", "Existing package.json detected. Augmenting project.");
	}

	const cwdParts = ctx.cwd.split(path.sep);
	const defaultName = cwdParts[cwdParts.length - 1] || "advent-of-code";

	if (ctx.yes) {
		ctx.projectName = toValidName(defaultName);
		await info("project", ctx.projectName);
		return;
	}

	ctx.projectName = toValidName(
		await handleTextPrompt(
			{
				message: "Project name:",
				placeholder: defaultName,
				validator: validators.projectName,
			},
			defaultName,
			() => ctx.exit(1),
		),
	);
}

async function handleSolutionsDir(ctx: InitContext): Promise<void> {
	const defaultDir = "solutions";

	// Use CLI flag if provided
	if (ctx.solutionsDirArg) {
		ctx.solutionsDir = ctx.solutionsDirArg;
		ctx.solutionsPath = path.resolve(ctx.cwd, ctx.solutionsDir);
		await info("dir", `Solutions will live in ./${ctx.solutionsDir}`);
		return;
	}

	// Skip prompt in quick mode or yes mode
	if (ctx.yes || ctx.quickMode) {
		ctx.solutionsDir = defaultDir;
		ctx.solutionsPath = path.resolve(ctx.cwd, ctx.solutionsDir);
		await info("dir", `Solutions will live in ./${ctx.solutionsDir}`);
		return;
	}

	ctx.solutionsDir = await handleTextPrompt(
		{
			message: "Folder for your daily solutions:",
			placeholder: defaultDir,
			validator: (value) =>
				validators.directoryName(value, ctx.cwd),
		},
		defaultDir,
		() => ctx.exit(1),
	);
	ctx.solutionsPath = path.resolve(ctx.cwd, ctx.solutionsDir);
}

async function handleYear(ctx: InitContext): Promise<void> {
	const currentYear = new Date().getFullYear().toString();

	if (ctx.yes || ctx.quickMode) {
		ctx.aocYear = currentYear;
		await info("year", ctx.aocYear);
		return;
	}

	ctx.aocYear = await handleTextPrompt(
		{
			message: "Which year are you tackling?",
			placeholder: currentYear,
		},
		currentYear,
		() => ctx.exit(1),
	);
}

async function handleAoCAuth(ctx: InitContext): Promise<void> {
	// Skip entirely in quick mode
	if (ctx.quickMode) {
		ctx.aocSession = "FILL_ME_IN";
		ctx.aocUserAgent = "FILL_ME_IN";
		await info("Advent of Code", "Configure later in .env");
		return;
	}

	if (ctx.yes) {
		ctx.aocSession = "FILL_ME_IN";
		ctx.aocUserAgent = "FILL_ME_IN";
		await info("Advent of Code", "Configure in .env before using");
		return;
	}

	log("");
	await info("Advent of Code Setup", "");

	// Check if already configured in .env
	const hasExistingSession = process.env.AOC_SESSION && process.env.AOC_SESSION !== "FILL_ME_IN";
	const hasExistingEmail = process.env.AOC_USER_AGENT && process.env.AOC_USER_AGENT !== "FILL_ME_IN";

	if (hasExistingSession) {
		await info("  Session", "Already configured in .env");
	} else {
		const wantsSession = await handleConfirmPrompt(
			{
				message:
					"Download puzzle inputs automatically? (requires your AoC session cookie, stored locally in .env)",
				initialValue: true,
			},
			() => ctx.exit(1),
		);

		if (wantsSession) {
			await info(
				"  Session Cookie",
				"Find this in your browser dev tools (Application > Cookies > adventofcode.com)",
			);
			ctx.aocSession = await handlePasswordPrompt(
				"Paste your 'session' cookie:",
				() => ctx.exit(1),
			);
			if (!ctx.aocSession) {
				ctx.aocSession = "FILL_ME_IN";
			}
		} else {
			ctx.aocSession = "FILL_ME_IN";
			await info("  Session", "Skipped - add to .env later if needed");
		}
	}

	if (!hasExistingEmail) {
		const wantsEmail = await handleConfirmPrompt(
			{
				message:
					"Include an email in User-Agent? (recommended by AoC; optional)",
				initialValue: true,
			},
			() => ctx.exit(1),
		);

		if (wantsEmail) {
			const gitEmail = await getGitEmail();
			ctx.aocUserAgent = await handleTextPrompt(
				{
					message: "Email for User-Agent:",
					placeholder: "your.email@example.com",
				},
				gitEmail || "",
				() => ctx.exit(1),
			);
		} else {
			ctx.aocUserAgent = "FILL_ME_IN";
			await info("  Email", "Skipped - add to .env later if needed");
		}
	} else {
		await info("  Email", "Already configured in .env");
	}

	log("");
}

async function handleDependencies(ctx: InitContext): Promise<void> {
	// Determine if we should install
	let shouldInstall: boolean | symbol = ctx.install ?? (ctx.yes || ctx.quickMode) ?? false;

	// If not explicitly set via CLI or --yes, prompt
	if (shouldInstall === false && !ctx.yes && !ctx.quickMode) {
		shouldInstall = await handleConfirmPrompt(
			{
				message: "Install dependencies?",
				initialValue: true,
			},
			() => ctx.exit(1),
		);
	}

	// Convert symbol to boolean if needed
	if (shouldInstall === false) {
		shouldInstall = false;
	} else if (shouldInstall !== true) {
		shouldInstall = true;
	}

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping dependency installation");
	} else if (shouldInstall) {
		ctx.tasks.push({
			pending: "Dependencies",
			start: `Dependencies installing with ${ctx.packageManager}...`,
			end: "Dependencies installed",
			onError: (e) => {
				error("error", String(e));
				error(
					"error",
					`Dependencies failed to install, please run ${color.bold(
						`${ctx.packageManager} install`,
					)} to install them manually after setup.`,
				);
			},
			while: () => installDeps(ctx.packageManager, ctx.cwd),
		});
	} else {
		await info(
			"Skipped",
			`Run ${color.bold(`${ctx.packageManager} install`)} when you're ready`,
		);
	}
}

async function installDeps(
	packageManager: string,
	cwd: string,
): Promise<string> {
	if (packageManager === "yarn") {
		const yarnLock = path.join(cwd, "yarn.lock");
		if (!fs.existsSync(yarnLock)) {
			await fs.promises.writeFile(yarnLock, "", { encoding: "utf-8" });
		}
	}
	return exec(packageManager, ["install"], { cwd, timeout: 90_000 });
}

async function handleGit(ctx: InitContext): Promise<void> {
	if (fs.existsSync(path.join(ctx.cwd, ".git"))) {
		await info("Nice!", "Git has already been initialized");
		return;
	}

	// Determine if we should initialize git
	let shouldInit: boolean | symbol = ctx.git ?? (ctx.yes || ctx.quickMode) ?? false;

	// If not explicitly set via CLI or --yes, prompt
	if (shouldInit === false && !ctx.yes && !ctx.quickMode) {
		shouldInit = await handleConfirmPrompt(
			{
				message: "Initialize a git repository?",
				initialValue: true,
			},
			() => ctx.exit(1),
		);
	}

	// Convert symbol to boolean if needed
	if (shouldInit === false) {
		shouldInit = false;
	} else if (shouldInit !== true) {
		shouldInit = true;
	}

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping Git initialization");
	} else if (shouldInit) {
		ctx.tasks.push({
			pending: "Git",
			start: "Git initializing...",
			end: "Git initialized",
			while: async () => {
				await exec("git", ["init"], { cwd: ctx.cwd });
				await exec("git", ["add", "-A"], { cwd: ctx.cwd });
				await exec(
					"git",
					["commit", "-m", "Initial commit from rudolph init"],
					{
						cwd: ctx.cwd,
					},
				);
			},
			onError: (e) => {
				error("error", String(e));
			},
		});
	} else {
		await info(
			"Skipped",
			`Run ${color.bold("git init")} later if you'd like`,
		);
	}
}

async function showNextSteps(ctx: InitContext): Promise<void> {
	const projectDir = ".";

	const commandMap: { [key: string]: string } = {
		npm: "npm run",
		bun: "bun run",
		yarn: "yarn",
		pnpm: "pnpm",
	};

	const pmPrefix = commandMap[ctx.packageManager] || "npm run";

	// Show additional setup hints based on what was configured
	log("");
	if (!ctx.aocSession || ctx.aocSession === "FILL_ME_IN") {
		log(
			"  " +
				color.dim(
					"Reminder: Add your AOC_SESSION to .env to auto-download inputs",
				),
		);
	}

	if (!ctx.aocUserAgent || ctx.aocUserAgent === "FILL_ME_IN") {
		log(
			"  " +
				color.dim(
					"Reminder: Add your email to AOC_USER_AGENT in .env (recommended by AoC)",
				),
		);
	}

	await nextSteps({ projectDir, pmPrefix });
}

export async function initCommand(options: InitOptions = {}): Promise<void> {
	console.log("");

	const ctx = createContext({
		yes: options.yes,
		dryRun: options.dryRun,
		packageManager: options.packageManager,
		solutionsDir: options.solutionsDir,
		install: options.install,
		git: options.git,
	});

	await verifyNetwork(ctx);
	await showIntro();

	// Show environment detection unless running in dry-run (which is mostly for testing)
	if (!ctx.dryRun) {
		await showEnvironmentDetection(ctx);
	}

	await handleQuickVsFull(ctx);

	// Core project setup
	await handleProjectName(ctx);
	await handleSolutionsDir(ctx);

	// Configuration
	await handleYear(ctx);
	await handleAoCAuth(ctx);

	// Optional advanced setup (only in full mode)
	if (!ctx.quickMode) {
		await handlePackageManager(ctx);
	}

	ctx.tasks.push({
		pending: "Scaffold Project",
		start: "Scaffolding project...",
		end: "Project scaffolded",
		while: () =>
			scaffoldProject({
				projectName: ctx.projectName!,
				cwd: ctx.cwd,
				aocSession: ctx.aocSession ?? "FILL_ME_IN",
				aocYear: ctx.aocYear!,
				aocUserAgent: ctx.aocUserAgent ?? "",
				solutionsDir: ctx.solutionsDir!,
				packageManager: ctx.packageManager,
			}),
	});

	await handleDependencies(ctx);
	await handleGit(ctx);

	await runTasks(ctx.tasks, { dryRun: ctx.dryRun });

	await showNextSteps(ctx);
}
