import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { RudolphError } from "../errors";
import { getDefaultDay, getDefaultYear } from "../utils/cli-helpers";
import { printBanner, printNextSteps } from "../utils/festive";
import { setupCommand } from "./setup";

const SAFE_LIST: (string | RegExp)[] = [
	".DS_Store",
	".git",
	".gitkeep",
	".gitattributes",
	".gitignore",
	".gitlab-ci.yml",
	".hg",
	".hgcheck",
	".hgignore",
	".idea",
	".npmignore",
	".travis.yml",
	".yarn",
	".yarnrc.yml",
	"docs",
	"LICENSE",
	"mkdocs.yml",
	"Thumbs.db",
	/\.iml$/,
	/^npm-debug\.log/,
	/^yarn-debug\.log/,
	/^yarn-error\.log/,
];

const fsp = fs.promises;

export interface InitCommandOptions {
	yes?: boolean;
	install?: boolean;
	skipInstall?: boolean;
	git?: boolean;
	skipGit?: boolean;
	firstDay?: boolean;
	skipFirstDay?: boolean;
}

interface InitAnswers {
	projectDir: string;
	solutionsDir: string;
	year: string;
	session: string;
	email?: string;
	shouldInstall: boolean;
	shouldGit: boolean;
	setupFirstDay: boolean;
	packageManager: string;
	force: boolean;
}

interface Task {
	label: string;
	start: string;
	end: string;
	run: () => Promise<void>;
	onError?: (error: Error) => void;
}

function detectPackageManager(): string | undefined {
	const ua = process.env.npm_config_user_agent;
	if (!ua) return;
	const name = ua.split(" ")[0].split("/")[0];
	return name === "npminstall" ? "cnpm" : name;
}

function isEmpty(dirPath: string): boolean {
	if (!fs.existsSync(dirPath)) {
		return true;
	}
	const conflicts = fs.readdirSync(dirPath).filter((content) => {
		return !SAFE_LIST.some((safeContent) => {
			return typeof safeContent === "string"
				? content === safeContent
				: safeContent.test(content);
		});
	});
	return conflicts.length === 0;
}

function toValidName(projectName: string): string {
	return projectName
		.trim()
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/^[._]/, "")
		.replace(/[^a-z\d\-~]+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
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

function generateEnvExample(config: { OUTPUT_DIR: string; AOC_YEAR: string }) {
	return `# Copy to .env and fill in your values
AOC_SESSION=your-session-cookie-here
OUTPUT_DIR=${config.OUTPUT_DIR}
AOC_YEAR=${config.AOC_YEAR}
AOC_USER_AGENT=you@example.com
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

function generatePackageJson(name: string, rudolphVersion: string) {
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
			rudolph: `^${rudolphVersion}`,
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

async function runShell(
	command: string,
	args: string[],
	cwd: string,
): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(`${command} ${args.join(" ")}`, {
			cwd,
			shell: true,
			stdio: "inherit",
		});
		child.on("close", (code) => {
			if (code === 0) {
				resolve();
			} else {
				reject(new Error(`${command} exited with code ${code ?? 1}`));
			}
		});
		child.on("error", (error) => reject(error));
	});
}

async function runTasks(tasks: Task[]): Promise<void> {
	for (const task of tasks) {
		const s = p.spinner();
		s.start(task.start);
		try {
			await task.run();
			s.stop(task.end);
		} catch (error) {
			s.stop(`${task.label} failed`);
			if (task.onError && error instanceof Error) {
				task.onError(error);
			}
		}
	}
}

async function writeFileWithPrompt(
	fullPath: string,
	content: string,
	force: boolean,
): Promise<void> {
	if (fs.existsSync(fullPath) && !force) {
		const overwrite = await p.confirm({
			message: `${path.basename(fullPath)} exists. Overwrite?`,
			initialValue: false,
		});
		if (p.isCancel(overwrite)) {
			p.cancel("Operation cancelled.");
			process.exit(0);
		}
		if (!overwrite) {
			return;
		}
	}
	await fsp.mkdir(path.dirname(fullPath), { recursive: true });
	await fsp.writeFile(fullPath, content);
}

async function requireSession(existing?: string): Promise<string> {
	if (existing && existing.length > 0) return existing;
	const result = await p.password({
		message: "AOC_SESSION cookie (required for downloads)",
		mask: "•",
		validate: (value) => {
			if (!value) return "Session is required";
			if (value.length < 90) return "Session looks too short";
		},
	});
	if (p.isCancel(result)) {
		p.cancel("Operation cancelled.");
		process.exit(0);
	}
	return result;
}

async function collectInputs(
	directory: string | undefined,
	options: InitCommandOptions,
): Promise<InitAnswers> {
	const packageManager = detectPackageManager() ?? "npm";
	const defaultProjectDir = directory ?? "./advent-of-code";
	const defaultSolutionsDir = "./solutions";
	const defaultYear = getDefaultYear();
	const shouldInstall = options.install ?? !options.skipInstall;
	const shouldGit = options.git ?? !options.skipGit;
	const setupFirstDay = options.firstDay ?? !options.skipFirstDay;

	if (options.yes) {
		const session = await requireSession(process.env.AOC_SESSION);
		return {
			projectDir: defaultProjectDir,
			solutionsDir: defaultSolutionsDir,
			year: defaultYear,
			session,
			email: process.env.AOC_USER_AGENT,
			shouldInstall,
			shouldGit,
			setupFirstDay,
			packageManager,
			force: true,
		};
	}

	const answers = await p.group(
		{
			projectDir: () =>
				p.text({
					message: "Project directory",
					placeholder: defaultProjectDir,
					defaultValue: defaultProjectDir,
					// Allow empty -> will fall back to defaultProjectDir
				}),
			solutionsDir: () =>
				p.text({
					message: "Solutions directory",
					placeholder: defaultSolutionsDir,
					defaultValue: defaultSolutionsDir,
					// Allow empty -> will fall back to defaultSolutionsDir
				}),
			year: () =>
				p.text({
					message: "Default year",
					placeholder: defaultYear,
					defaultValue: defaultYear,
					validate: (value) => {
						if (!value) return;
						const num = Number.parseInt(value, 10);
						if (
							Number.isNaN(num) ||
							num < 2015 ||
							num > new Date().getFullYear()
						) {
							return "Enter a valid year";
						}
					},
				}),
			session: () =>
				p.password({
					message: "AOC_SESSION cookie",
					mask: "•",
					validate: (value) => {
						if (!value) return "Session is required";
						if (value.length < 90) return "Session looks too short";
					},
				}),
			email: () =>
				p.text({
					message: "Email for AoC user agent (optional)",
					placeholder: "you@example.com",
				}),
			shouldInstall: () =>
				p.confirm({
					message: "Install dependencies?",
					initialValue: shouldInstall,
				}),
			shouldGit: () =>
				p.confirm({
					message: "Initialize git?",
					initialValue: shouldGit,
				}),
			setupFirstDay: () =>
				p.confirm({
					message: `Setup today's puzzle (Day ${getDefaultDay()})?`,
					initialValue: setupFirstDay,
				}),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);

	const projectDir = answers.projectDir.trim() || defaultProjectDir;
	const solutionsDir = answers.solutionsDir.trim() || defaultSolutionsDir;
	const year = answers.year.trim() || defaultYear;

	return {
		projectDir,
		solutionsDir,
		year,
		session: answers.session,
		email: answers.email?.trim() || undefined,
		shouldInstall: answers.shouldInstall,
		shouldGit: answers.shouldGit,
		setupFirstDay: answers.setupFirstDay,
		packageManager,
		force: false,
	};
}

async function scaffoldProject(
	inputs: InitAnswers,
	rudolphVersion: string,
): Promise<string> {
	const projectDir = path.resolve(inputs.projectDir);
	const solutionsDir = path.isAbsolute(inputs.solutionsDir)
		? inputs.solutionsDir
		: path.resolve(projectDir, inputs.solutionsDir);

	if (!isEmpty(projectDir) && !inputs.force) {
		const proceed = await p.confirm({
			message: "Directory is not empty. Continue?",
			initialValue: false,
		});
		if (p.isCancel(proceed) || !proceed) {
			p.cancel("Operation cancelled.");
			process.exit(0);
		}
	}

	await fsp.mkdir(projectDir, { recursive: true });
	await fsp.mkdir(solutionsDir, { recursive: true });
	await fsp.mkdir(path.join(solutionsDir, inputs.year), { recursive: true });

	const envContent = generateEnvFile({
		AOC_SESSION: inputs.session,
		OUTPUT_DIR: inputs.solutionsDir,
		AOC_YEAR: inputs.year,
		AOC_USER_AGENT: inputs.email,
	});
	const envExample = generateEnvExample({
		OUTPUT_DIR: inputs.solutionsDir,
		AOC_YEAR: inputs.year,
	});

	await writeFileWithPrompt(
		path.join(projectDir, ".env"),
		envContent,
		inputs.force,
	);
	await writeFileWithPrompt(
		path.join(projectDir, ".env.example"),
		envExample,
		inputs.force,
	);
	await ensureGitignore(projectDir, [".env", ".env.local", "node_modules"]);
	await writeFileWithPrompt(
		path.join(projectDir, "package.json"),
		generatePackageJson(path.basename(projectDir), rudolphVersion),
		inputs.force,
	);
	await writeFileWithPrompt(
		path.join(projectDir, "README.md"),
		generateReadme(
			path.basename(projectDir),
			inputs.year,
			inputs.packageManager,
		),
		inputs.force,
	);

	return projectDir;
}

export async function initCommand(
	directory?: string,
	options: InitCommandOptions = {},
	rudolphVersion = "0.0.0-development",
): Promise<void> {
	printBanner();
	p.intro(pc.bgRed(pc.white(" 🎄 Let's set up your Advent of Code workshop ")));

	const answers = await collectInputs(directory, options);
	const projectDir = await scaffoldProject(answers, rudolphVersion);

	process.env.AOC_SESSION = answers.session;
	process.env.OUTPUT_DIR = answers.solutionsDir;
	process.env.AOC_YEAR = answers.year;
	if (answers.email) {
		process.env.AOC_USER_AGENT = answers.email;
	}

	const tasks: Task[] = [];

	if (answers.shouldInstall) {
		tasks.push({
			label: "Dependencies",
			start: `Installing dependencies with ${answers.packageManager}...`,
			end: "Dependencies installed",
			run: () =>
				runShell(answers.packageManager, ["install"], projectDir).catch(
					(error) => {
						throw new RudolphError(error.message);
					},
				),
			onError: () => {
				p.note(
					`Run "${answers.packageManager} install" inside ${projectDir}`,
					"Dependency installation failed",
				);
			},
		});
	}

	if (answers.shouldGit) {
		tasks.push({
			label: "Git",
			start: "Initializing git...",
			end: "Git repository initialized",
			run: async () => {
				if (fs.existsSync(path.join(projectDir, ".git"))) return;
				await runShell("git", ["init"], projectDir);
				await runShell("git", ["add", "-A"], projectDir);
				await runShell("git", ["commit", "-m", '"Initial commit"'], projectDir);
			},
			onError: () => {
				p.note(
					"Git init failed. You can run git init manually later.",
					"Git init failed",
				);
			},
		});
	}

	if (answers.setupFirstDay) {
		tasks.push({
			label: "Day setup",
			start: `Setting up Day ${getDefaultDay()}...`,
			end: `Day ${getDefaultDay()} ready`,
			run: async () => {
				const previousCwd = process.cwd();
				process.chdir(projectDir);
				try {
					await setupCommand(
						answers.year,
						getDefaultDay(),
						false,
						answers.solutionsDir,
					);
				} finally {
					process.chdir(previousCwd);
				}
			},
			onError: (error) => {
				p.note(error.message, "Day setup failed");
			},
		});
	}

	await runTasks(tasks);

	p.outro(pc.green("🛷 Your sleigh is ready for takeoff!"));

	const cdCmd = path.relative(process.cwd(), projectDir) || ".";
	console.log(pc.gray(`Next steps:`));
	console.log(pc.gray(`  cd ${cdCmd}`));
	printNextSteps(
		answers.solutionsDir,
		tasks.some((t) => t.label === "Day setup") ? getDefaultDay() : undefined,
	);
}

export const initInternals = {
	detectPackageManager,
	isEmpty,
	toValidName,
	generateEnvFile,
	generateEnvExample,
	generatePackageJson,
	generateReadme,
};
