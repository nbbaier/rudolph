import fs from "node:fs";
import path from "node:path";
import type { Context } from "../context";
import { getVersion } from "../lib/registry";
import { toValidName } from "../lib/validation";

const debug = (...args: unknown[]) => {
	if (process.env.DEBUG_SCAFFOLD) {
		console.log("[scaffold]", ...args);
	}
};

const RUNNER_TEMPLATE = `function part1(_input: string): number | string {
	return 0;
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };
`;

export async function scaffold(
	ctx: Pick<
		Context,
		| "cwd"
		| "projectName"
		| "aocSession"
		| "aocYear"
		| "aocUserAgent"
		| "dryRun"
		| "tasks"
		| "exit"
		| "solutionsDir"
		| "packageManager"
	>,
) {
	const { projectName, cwd, aocSession, aocYear, aocUserAgent, solutionsDir } =
		ctx;

	if (!projectName || !cwd || !aocYear || !solutionsDir) {
		ctx.exit(1);
	}

	ctx.tasks.push({
		pending: "Scaffold Project",
		start: "Scaffolding project...",
		end: "Project scaffolded",
		while: () =>
			scaffoldProject({
				projectName,
				cwd,
				aocSession: aocSession ?? "",
				aocYear,
				aocUserAgent: aocUserAgent ?? "",
				solutionsDir,
				packageManager: ctx.packageManager,
			}),
	});
}

function generateEnvFile(config: {
	AOC_SESSION: string;
	OUTPUT_DIR: string;
	AOC_YEAR: string;
	AOC_USER_AGENT?: string;
}): string {
	const lines: string[] = [];
	for (const [key, value] of Object.entries(config)) {
		if (value !== undefined && value !== "") {
			const needsQuotes = /[\s#=]/.test(value);
			lines.push(`${key}=${needsQuotes ? `"${value}"` : value}`);
		}
	}
	return `${lines.join("\n")}\n`;
}

function generatePackageJson(name: string, version: string) {
	const pkg = {
		name: toValidName(name),
		private: true,
		type: "module",
		version: "0.1.0",
		scripts: {
			setup: "rudolph setup",
			"run:input": "rudolph run input",
			"run:sample": "rudolph run sample",
		},
		dependencies: {
			rudolph: `^${version}`,
		},
	};
	return `${JSON.stringify(pkg, null, 2)}\n`;
}

function generateReadme(projectName: string, year: string, pm: string) {
	return `# ${projectName}

My solutions for Advent of Code ${year}.

## Setup

\`${pm} install\`

## Usage

- \`${pm} run setup\` to prepare a day (defaults to today)
- \`${pm} run run:sample\` to run solutions on the sample input
- \`${pm} run run:input\` to run solutions on the real input
`;
}

async function ensureGitignore(cwd: string, entries: string[]): Promise<void> {
	const gitignorePath = path.join(cwd, ".gitignore");
	let content = "";
	if (fs.existsSync(gitignorePath)) {
		content = await fs.promises.readFile(gitignorePath, "utf-8");
	}
	const lines = content.split("\n").filter(Boolean);
	const toAdd = entries.filter((entry) => !lines.includes(entry));
	if (toAdd.length > 0) {
		const combined = `${content.trimEnd()}\n${toAdd.join("\n")}\n`;
		await fs.promises.writeFile(gitignorePath, combined);
	}
}

type ScaffoldContext = {
	projectName: string;
	cwd: string;
	packageManager: string;
	aocSession: string;
	aocYear: string;
	aocUserAgent: string;
	solutionsDir: string;
};

export async function scaffoldProject(ctx: ScaffoldContext) {
	const projectDir = ctx.cwd;
	const projectDirExists = fs.existsSync(projectDir);
	await fs.promises.mkdir(projectDir, { recursive: true });
	debug("projectDir", projectDir, "exists?", projectDirExists);
	const createdPaths: string[] = [];
	if (!projectDirExists) createdPaths.push(projectDir);

	const rudolphVersion = await getVersion(ctx.packageManager, "rudolph");
	const packageJson = generatePackageJson(ctx.projectName, rudolphVersion);
	debug("rudolphVersion", rudolphVersion);

	const envFile = generateEnvFile({
		AOC_SESSION: ctx.aocSession,
		OUTPUT_DIR: `./${ctx.solutionsDir ?? "solutions"}`,
		AOC_YEAR: ctx.aocYear,
		AOC_USER_AGENT: ctx.aocUserAgent,
	});
	debug("env OUTPUT_DIR", `./${ctx.solutionsDir ?? "solutions"}`);

	const readme = generateReadme(
		ctx.projectName,
		ctx.aocYear,
		ctx.packageManager,
	);
	debug("readme for", ctx.projectName);

	const solutionsRoot = path.join(projectDir, ctx.solutionsDir);
	await fs.promises.mkdir(solutionsRoot, { recursive: true });
	debug("solutionsRoot", solutionsRoot);
	createdPaths.push(solutionsRoot);

	const yearDir = path.join(solutionsRoot, ctx.aocYear);
	await fs.promises.mkdir(yearDir, { recursive: true });
	debug("yearDir", yearDir);
	createdPaths.push(yearDir);

	const day = String(new Date().getDate()).padStart(2, "0");
	const dayDir = path.join(yearDir, `day${day}`);
	await fs.promises.mkdir(dayDir, { recursive: true });
	debug("dayDir", dayDir);
	createdPaths.push(dayDir);

	await fs.promises.writeFile(
		path.resolve(projectDir, "package.json"),
		packageJson,
	);
	createdPaths.push(path.resolve(projectDir, "package.json"));
	await fs.promises.writeFile(path.resolve(projectDir, "README.md"), readme);
	createdPaths.push(path.resolve(projectDir, "README.md"));
	debug("wrote package.json, README.md");

	if (!projectDirExists) {
		const envPath = path.resolve(projectDir, ".env");
		await fs.promises.writeFile(envPath, envFile);
		createdPaths.push(envPath);
		debug("wrote .env");
	}

	await fs.promises.writeFile(
		path.resolve(dayDir, "index.ts"),
		RUNNER_TEMPLATE,
	);
	createdPaths.push(path.resolve(dayDir, "index.ts"));
	await fs.promises.writeFile(path.resolve(dayDir, "puzzle.md"), "");
	createdPaths.push(path.resolve(dayDir, "puzzle.md"));
	await fs.promises.writeFile(path.resolve(dayDir, "input.txt"), "");
	createdPaths.push(path.resolve(dayDir, "input.txt"));
	await fs.promises.writeFile(path.resolve(dayDir, "sample.txt"), "");
	createdPaths.push(path.resolve(dayDir, "sample.txt"));
	debug("seeded day files");

	if (!projectDirExists) {
		await ensureGitignore(projectDir, [
			"node_modules",
			"dist",
			"build",
			"coverage",
			"logs",
			"*.log",
			"*.log.*",
			"*.log.*.*",
		]);
		createdPaths.push(path.resolve(projectDir, ".gitignore"));
		debug("ensured .gitignore");
	}

	debug("created paths", createdPaths);
}
