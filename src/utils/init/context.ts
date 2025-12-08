export interface Task {
	pending?: string;
	start?: string;
	end?: string;
	while?: () => Promise<unknown>;
	onError?: (error: unknown) => void;
}

export interface InitContext {
	cwd: string;
	packageManager: string;
	dryRun?: boolean;
	yes?: boolean;
	quickMode?: boolean;
	projectName?: string;
	install?: boolean;
	git?: boolean;
	solutionsDirArg?: string;
	solutionsDir?: string;
	solutionsPath?: string;
	aocSession?: string;
	aocUserAgent?: string;
	aocYear?: string;
	tasks: Task[];
	exit(code: number): never;
}

export function detectPackageManager(): string {
	if (!process.env.npm_config_user_agent) return "npm";
	const specifier = process.env.npm_config_user_agent.split(" ")[0];
	const name = specifier?.substring(0, specifier?.lastIndexOf("/") ?? 0);
	return name === "npminstall" ? "cnpm" : name || "npm";
}

export function createContext(options: {
	yes?: boolean;
	dryRun?: boolean;
	install?: boolean;
	git?: boolean;
	solutionsDir?: string;
	packageManager?: string;
}): InitContext {
	return {
		cwd: process.cwd(),
		packageManager: options.packageManager || detectPackageManager(),
		dryRun: options.dryRun,
		yes: options.yes,
		install: options.install,
		git: options.git,
		solutionsDirArg: options.solutionsDir,
		tasks: [],
		exit(code: number): never {
			process.exit(code);
		},
	};
}
