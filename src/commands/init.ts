import dns from "node:dns/promises";
import fs from "node:fs";
import path from "node:path";
import { confirm, isCancel, password, select, text } from "@clack/prompts";
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
} from "../utils/init";

export interface InitOptions {
	yes?: boolean;
	dryRun?: boolean;
	packageManager?: string;
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

		const shouldClear = await confirm({
			message:
				"Directory is not empty. Would you like to continue anyway? (existing files may be overwritten)",
			initialValue: false,
		});

		if (isCancel(shouldClear) || !shouldClear) {
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

	const name = await text({
		message: "Project name:",
		placeholder: defaultName,
		initialValue: defaultName,
		validate(value: string) {
			if (!value.trim()) return "Please enter a project name.";
			if (value.match(/[^\x20-\x7E]/g) !== null)
				return "Invalid non-printable character present!";
			return undefined;
		},
	});

	if (isCancel(name)) {
		ctx.exit(1);
	}

	ctx.projectName = toValidName(
		typeof name === "string" ? name.trim() : defaultName,
	);
}

async function handlePackageManager(ctx: InitContext): Promise<void> {
	if (ctx.yes) {
		await info("pm", ctx.packageManager);
		return;
	}

	const pm = await select({
		message: "Which package manager do you want to use?",
		options: [
			{ value: "npm", label: "npm" },
			{ value: "bun", label: "bun" },
			{ value: "yarn", label: "yarn" },
			{ value: "pnpm", label: "pnpm" },
		],
		initialValue: ctx.packageManager,
	});

	if (isCancel(pm)) {
		ctx.exit(1);
	}

	ctx.packageManager = pm as string;
}

async function handleSolutionsDir(ctx: InitContext): Promise<void> {
	if (ctx.yes) {
		ctx.solutionsDir = "solutions";
		ctx.solutionsPath = path.resolve(ctx.cwd, ctx.solutionsDir);
		await info("dir", `Solutions will live in ./${ctx.solutionsDir}`);
		return;
	}

	const name = await text({
		message: "Folder for your daily solutions:",
		placeholder: "solutions",
		initialValue: "solutions",
		validate(value: string) {
			if (!value) return "Please enter a folder name.";
			const candidate = path.resolve(ctx.cwd, value);
			if (!isEmpty(candidate)) {
				return "Directory is not empty!";
			}
			if (value.match(/[^\x20-\x7E]/g) !== null)
				return "Invalid non-printable character present!";
			return undefined;
		},
	});

	if (isCancel(name)) {
		ctx.exit(1);
	}

	ctx.solutionsDir = typeof name === "string" ? name.trim() : "solutions";
	ctx.solutionsPath = path.resolve(ctx.cwd, ctx.solutionsDir);
}

async function handleYear(ctx: InitContext): Promise<void> {
	const currentYear = new Date().getFullYear().toString();

	if (ctx.yes) {
		ctx.aocYear = currentYear;
		await info("year", ctx.aocYear);
		return;
	}

	const year = await text({
		message: "Which year are you tackling?",
		initialValue: currentYear,
		placeholder: currentYear,
	});

	if (isCancel(year)) {
		ctx.exit(1);
	}

	ctx.aocYear = typeof year === "string" ? year.trim() : currentYear;
}

async function handleSession(ctx: InitContext): Promise<void> {
	if (ctx.yes) {
		ctx.aocSession = "FILL_ME_IN";
		await info(
			"session",
			"Set to FILL_ME_IN in .env; update it with your AoC session cookie before fetching inputs.",
		);
		return;
	}

	const wantsSession = await confirm({
		message:
			"Download puzzle inputs automatically? (requires your AoC session cookie, stored locally in .env)",
		initialValue: true,
	});

	if (isCancel(wantsSession)) {
		ctx.exit(1);
	}

	if (!wantsSession) {
		ctx.aocSession = "FILL_ME_IN";
		await info("Skipped", "You can add your session cookie to .env later.");
		return;
	}

	const session = await password({
		message:
			"Paste your 'session' cookie from adventofcode.com (found in browser dev tools):",
	});

	if (isCancel(session)) {
		ctx.exit(1);
	}

	ctx.aocSession = typeof session === "string" ? session.trim() : "FILL_ME_IN";
}

async function handleEmail(ctx: InitContext): Promise<void> {
	if (ctx.yes) {
		ctx.aocUserAgent = "FILL_ME_IN";
		await info(
			"email",
			"Set to FILL_ME_IN in .env; update it if you'd like to include a contact in the User-Agent.",
		);
		return;
	}

	const wantsEmail = await confirm({
		message:
			"Include an email in the User-Agent? (AoC recommends a contact for API usage; optional but polite)",
		initialValue: true,
	});

	if (isCancel(wantsEmail)) {
		ctx.exit(1);
	}

	if (!wantsEmail) {
		await info(
			"Skipped",
			"You can add an email to .env (AOC_USER_AGENT) later.",
		);
		return;
	}

	const gitEmail = await getGitEmail();

	const email = await text({
		message: "Email for User-Agent (any contact you're comfortable with):",
		placeholder: "your.email@example.com",
		initialValue: gitEmail || "",
	});

	if (isCancel(email)) {
		ctx.exit(1);
	}

	ctx.aocUserAgent = typeof email === "string" ? email.trim() : "";
}

async function handleDependencies(ctx: InitContext): Promise<void> {
	let deps: boolean | symbol = ctx.install ?? ctx.yes ?? false;

	if (deps === false) {
		deps = await confirm({
			message: "Install dependencies?",
			initialValue: true,
		});

		if (isCancel(deps)) {
			deps = false;
		}

		ctx.install = deps as boolean;
	}

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping dependency installation");
	} else if (deps) {
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
			`Run ${ctx.packageManager} install when you're ready`,
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

	let _git: boolean | symbol = ctx.git ?? ctx.yes ?? false;

	if (_git === false) {
		_git = await confirm({
			message: "Initialize a git repository and make an initial commit?",
			initialValue: true,
		});

		if (isCancel(_git)) {
			_git = false;
		}
	}

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping Git initialization");
	} else if (_git) {
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
			`You can run ${color.reset("git init")} later if you'd like`,
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
	await nextSteps({ projectDir, pmPrefix });
}

export async function initCommand(options: InitOptions = {}): Promise<void> {
	console.log("");

	const ctx = createContext({
		yes: options.yes,
		dryRun: options.dryRun,
		packageManager: options.packageManager,
	});

	await verifyNetwork(ctx);
	await showIntro();

	await handlePackageManager(ctx);
	await handleProjectName(ctx);
	await handleSolutionsDir(ctx);
	await handleYear(ctx);
	await handleSession(ctx);
	await handleEmail(ctx);

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
