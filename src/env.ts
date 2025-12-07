import fs from "node:fs";
import path from "node:path";

const ENV_FILE_NAME = ".env";
const DEFAULT_OUTPUT_DIR = "./aoc";

export function loadEnvFile(startDir: string = process.cwd()): void {
	let dir = startDir;
	while (true) {
		const envPath = path.join(dir, ENV_FILE_NAME);
		if (fs.existsSync(envPath)) {
			const content = fs.readFileSync(envPath, "utf-8");
			for (const line of content.split("\n")) {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) continue;
				const eqIndex = trimmed.indexOf("=");
				if (eqIndex === -1) continue;
				const key = trimmed.slice(0, eqIndex).trim();
				let value = trimmed.slice(eqIndex + 1).trim();
				if (
					(value.startsWith('"') && value.endsWith('"')) ||
					(value.startsWith("'") && value.endsWith("'"))
				) {
					value = value.slice(1, -1);
				}
				if (!process.env[key]) {
					process.env[key] = value;
				}
			}
			return;
		}
		const parentDir = path.dirname(dir);
		if (parentDir === dir) {
			return;
		}
		dir = parentDir;
	}
}

export function getSession(): string | undefined {
	return process.env.AOC_SESSION;
}

export function getOutputDir(): string {
	return process.env.OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

const PACKAGE_VERSION = "1.0.0";
const PACKAGE_REPO = "https://github.com/nbbaier/rudolph";

function isValidEmail(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function getUserAgent(): string {
	const userAgent = process.env.AOC_USER_AGENT;
	if (userAgent && isValidEmail(userAgent)) {
		return `rudolph/${PACKAGE_VERSION} (${userAgent})`;
	}
	if (userAgent && !isValidEmail(userAgent)) {
		console.warn(
			"Warning: AOC_USER_AGENT should be an email address for AoC compliance.",
		);
	}
	return `rudolph/${PACKAGE_VERSION} (+${PACKAGE_REPO})`;
}

export function getAoCHeaders(): Record<string, string> {
	const session = getSession();
	const headers: Record<string, string> = {
		"User-Agent": getUserAgent(),
	};
	if (session) {
		headers.Cookie = `session=${session}`;
	}
	return headers;
}
