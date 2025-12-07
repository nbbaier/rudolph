import path from "node:path";
import arg from "arg";

export interface Task {
	pending?: string;
	start?: string;
	end?: string;
	while?: () => Promise<unknown>;
	onError?: (error: unknown) => void;
}

export interface Context {
	cwd: string;
	packageManager: string;
	dryRun?: boolean;
	yes?: boolean;
	debugScaffold?: boolean;
	projectName?: string;
	projectNameExplicitlyProvided?: boolean;
	install?: boolean;
	git?: boolean;
	solutionsDir?: string;
	solutionsPath?: string;
	aocSession?: string;
	aocUserAgent?: string;
	aocYear?: string;
	tasks: Task[];
	exit(code: number): never;
}

export async function getContext(argv: string[]): Promise<Context> {
	const flags = arg(
		{
			"--yes": Boolean,
			"--no": Boolean,
			"--install": Boolean,
			"--no-install": Boolean,
			"--git": Boolean,
			"--no-git": Boolean,
			"--dry-run": Boolean,
			"--aoc-session": String,
			"--aoc-user-agent": String,
			"--aoc-year": String,
			"--first-day": Boolean,
			"--debug-scaffold": Boolean,
			"-y": "--yes",
			"-n": "--no",
		},
		{ argv, permissive: true },
	);

	const packageManager = detectPackageManager() ?? "npm";
	const targetDir = flags._[0];
	let {
		"--no": no,
		"--yes": yes,
		"--install": install,
		"--no-install": noInstall,
		"--git": git,
		"--no-git": noGit,
		"--dry-run": dryRun,
		"--debug-scaffold": debugScaffold,
	} = flags;
	const projectName = targetDir;

	if (no) {
		yes = false;
		if (install === undefined) install = false;
		if (git === undefined) git = false;
	}

	// Resolve the target directory relative to the current working directory
	const resolvedCwd = targetDir
		? path.resolve(process.cwd(), targetDir)
		: process.cwd();

	const context: Context = {
		packageManager,
		dryRun,
		debugScaffold,
		projectName,
		projectNameExplicitlyProvided: !!targetDir,
		yes,
		install: install ?? (noInstall ? false : undefined),
		git: git ?? (noGit ? false : undefined),
		cwd: resolvedCwd,
		exit(code) {
			process.exit(code);
		},
		tasks: [],
	};
	if (context.debugScaffold) {
		process.env.DEBUG_SCAFFOLD = "1";
	}
	return context;
}

function detectPackageManager() {
	if (!process.env.npm_config_user_agent) return;
	const specifier = process.env.npm_config_user_agent.split(" ")[0];
	const name = specifier?.substring(0, specifier?.lastIndexOf("/") ?? 0);
	return name === "npminstall" ? "cnpm" : name;
}
