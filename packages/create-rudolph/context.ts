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
	projectName?: string;
	install?: boolean;
	git?: boolean;
	solutionsDir?: string;
	solutionsPath?: string;
	aocSession?: string;
	aocUserAgent?: string;
	aocYear?: string;
	firstDay?: boolean;
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
			"-y": "--yes",
			"-n": "--no",
		},
		{ argv, permissive: true },
	);

	const packageManager = detectPackageManager() ?? "npm";
	const cwd = flags._[0];
	let {
		"--no": no,
		"--yes": yes,
		"--install": install,
		"--no-install": noInstall,
		"--git": git,
		"--no-git": noGit,
		"--dry-run": dryRun,
	} = flags;
	const projectName = cwd;

	if (no) {
		yes = false;
		if (install === undefined) install = false;
		if (git === undefined) git = false;
	}

	const context: Context = {
		packageManager,
		dryRun,
		projectName,
		yes,
		install: install ?? (noInstall ? false : undefined),
		git: git ?? (noGit ? false : undefined),
		cwd: cwd ?? "",
		exit(code) {
			process.exit(code);
		},
		tasks: [],
	};
	return context;
}

function detectPackageManager() {
	if (!process.env.npm_config_user_agent) return;
	const specifier = process.env.npm_config_user_agent.split(" ")[0];
	const name = specifier?.substring(0, specifier?.lastIndexOf("/") ?? 0);
	return name === "npminstall" ? "cnpm" : name;
}
