import fs from "node:fs";
import path from "node:path";
import type { InitContext } from "./context";
import { getVersion } from "./registry";
import { toValidName } from "./validation";

export async function scaffold(
	ctx: Pick<
		InitContext,
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

function packageManagerSpec(pm: string): string {
	const agent = process.env.npm_config_user_agent ?? "";
	const match = agent.match(new RegExp(`${pm}/([\\d\\.]+)`));
	const version = match?.[1] ?? "latest";
	return `${pm}@${version}`;
}

function generatePackageJson(name: string, version: string, pm: string) {
	const devDeps: Record<string, string> = {
		typescript: "^5.9.3",
		"@types/node": "^22.9.0",
	};
	if (pm === "bun") {
		devDeps["@types/bun"] = "^1.3.3";
	}

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
			"@nbbaier/rudolph": `^${version}`,
		},
		devDependencies: devDeps,
		packageManager: packageManagerSpec(pm),
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

	const rudolphVersion = await getVersion(
		ctx.packageManager,
		"@nbbaier/rudolph",
	);
	const packageJson = generatePackageJson(
		ctx.projectName,
		rudolphVersion,
		ctx.packageManager,
	);

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

	await fs.promises.mkdir(path.join(projectDir, ctx.solutionsDir), {
		recursive: true,
	});

	await fs.promises.writeFile(
		path.resolve(projectDir, "package.json"),
		packageJson,
	);
	await fs.promises.writeFile(path.resolve(projectDir, ".env"), envFile);
	await fs.promises.writeFile(path.resolve(projectDir, "README.md"), readme);

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
