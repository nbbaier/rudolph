import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";
import { getOutputDir } from "../env";
import { getDefaultDay, getDefaultYear } from "../utils/cli-helpers";
import { setupCommand } from "./setup";

async function prompt(question: string, def?: string): Promise<string> {
	const rl = createInterface({ input, output });
	const answer = await rl.question(
		def ? `${question} (${def}): ` : `${question}: `,
	);
	await rl.close();
	return answer.trim() || (def ?? "");
}

function runCommand(cmd: string) {
	if (!cmd) return;
	spawnSync(cmd, { stdio: "inherit", shell: true });
}

export async function initCommand(): Promise<void> {
	const outputDir = await prompt("Output directory", getOutputDir());
	const year = await prompt("Default year", getDefaultYear());
	const session = await prompt("AOC_SESSION (leave blank to skip)");
	const installDeps =
		(await prompt("Install dependencies now? (y/n)", "y")).toLowerCase() ===
		"y";
	const installCmd = installDeps
		? await prompt("Install command", "bun install")
		: "";
	const initGit =
		(await prompt("Initialize git repo? (y/n)", "y")).toLowerCase() === "y";
	const scaffoldToday =
		(await prompt("Scaffold today? (y/n)", "y")).toLowerCase() === "y";

	const envPath = path.join(process.cwd(), ".env");
	const shouldWriteEnv =
		!fs.existsSync(envPath) ||
		(await prompt(".env exists. Overwrite? (y/n)", "n")).toLowerCase() === "y";
	if (shouldWriteEnv) {
		const lines = [
			session ? `AOC_SESSION=${session}` : "",
			outputDir ? `OUTPUT_DIR=${outputDir}` : "",
			year ? `AOC_YEAR=${year}` : "",
		].filter(Boolean);
		fs.writeFileSync(envPath, `${lines.join("\n")}\n`);
	}

	if (session) {
		process.env.AOC_SESSION = session;
	}
	if (outputDir) {
		process.env.OUTPUT_DIR = outputDir;
	}
	if (year) {
		process.env.AOC_YEAR = year;
	}

	if (initGit && !fs.existsSync(path.join(process.cwd(), ".git"))) {
		runCommand("git init");
	}

	if (installCmd) {
		runCommand(installCmd);
	}

	if (scaffoldToday) {
		const day = getDefaultDay();
		await setupCommand(year, day, false, outputDir);
	}
}
