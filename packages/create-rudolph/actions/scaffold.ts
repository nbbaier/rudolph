import fs from "node:fs";
import path from "node:path";
import type { Context } from "../context";
import { getVersion } from "../messages";
import { toValidName } from "../shared";
import { shell } from "../shell";

const fsp = fs.promises;

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

	if (!projectName || !cwd || !aocSession || !aocYear || !solutionsDir) {
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
				aocSession,
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
			run: "rudolph run input",
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
- \`rudolph run sample\` to run solutions on the sample input
- \`rudolph run input\` to run solutions on the real input
`;
}

async function ensureGitignore(cwd: string, entries: string[]): Promise<void> {
	const gitignorePath = path.join(cwd, ".gitignore");
	let content = "";
	if (fs.existsSync(gitignorePath)) {
		content = await fsp.readFile(gitignorePath, "utf-8");
	}
	const lines = content.split("\n").filter(Boolean);
	const toAdd = entries.filter((entry) => !lines.includes(entry));
	if (toAdd.length > 0) {
		const combined = `${content.trimEnd()}\n${toAdd.join("\n")}\n`;
		await fsp.writeFile(gitignorePath, combined);
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
	const projectDir = path.resolve(ctx.cwd, ctx.projectName);

	const rudolphVersion = await getVersion(ctx.packageManager, "rudolph");
	const packageJson = generatePackageJson(ctx.projectName, rudolphVersion);

	const envFile = generateEnvFile({
		AOC_SESSION: ctx.aocSession,
		OUTPUT_DIR: `./${ctx.solutionsDir ?? "solutions"}`,
		AOC_YEAR: ctx.aocYear,
		AOC_USER_AGENT: ctx.aocUserAgent,
	});

	const readme = generateReadme(
		ctx.projectName,
		ctx.aocYear,
		ctx.packageManager,
	);

	await shell("mkdir", ["-p", projectDir]);
	await shell("mkdir", ["-p", ctx.solutionsDir]);
	await shell("touch", [path.resolve(projectDir, "package.json")]);
	await shell("touch", [path.resolve(projectDir, ".env")]);
	await shell("touch", [path.resolve(projectDir, "README.md")]);

	await fsp.writeFile(path.resolve(projectDir, "package.json"), packageJson);
	await fsp.writeFile(path.resolve(projectDir, ".env"), envFile);
	await fsp.writeFile(path.resolve(projectDir, "README.md"), readme);

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
}
