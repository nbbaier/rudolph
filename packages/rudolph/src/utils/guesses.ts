import fs from "node:fs";
import fsPromises from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { getDayPath } from ".";
import { ensureDirectory } from "./runtime";

export type SubmissionStatus =
	| "correct"
	| "already_completed"
	| "incorrect"
	| "too_high"
	| "too_low"
	| "wait"
	| "locked"
	| "duplicate"
	| "error";

export interface GuessEntry {
	timestamp: string;
	year: string;
	day: string;
	part: "1" | "2";
	answer: string;
	status: SubmissionStatus;
	message: string;
}

const CACHE_ROOT = path.join(os.homedir(), ".cache", "rudolph");

function getPaths(year: string, day: string, outputDir?: string) {
	const cachePath = path.join(CACHE_ROOT, year, `day${day}.ndjson`);
	const projectPath = path.join(
		getDayPath(year, day, outputDir),
		"guesses.ndjson",
	);
	return { cachePath, projectPath };
}

async function readEntries(filePath: string): Promise<GuessEntry[]> {
	if (!fs.existsSync(filePath)) {
		return [];
	}
	const content = await fsPromises.readFile(filePath, "utf-8");
	return content
		.split("\n")
		.filter(Boolean)
		.map((line) => {
			try {
				return JSON.parse(line) as GuessEntry;
			} catch {
				return null;
			}
		})
		.filter((entry): entry is GuessEntry => Boolean(entry));
}

async function appendEntry(filePath: string, entry: GuessEntry): Promise<void> {
	await ensureDirectory(filePath);
	await fsPromises.appendFile(filePath, `${JSON.stringify(entry)}\n`);
}

export async function loadGuesses(
	year: string,
	day: string,
	outputDir?: string,
): Promise<GuessEntry[]> {
	const { cachePath, projectPath } = getPaths(year, day, outputDir);
	const combined = [
		...(await readEntries(cachePath)),
		...(await readEntries(projectPath)),
	];
	const dedup = new Map<string, GuessEntry>();
	for (const entry of combined) {
		const key = `${entry.timestamp}-${entry.part}-${entry.answer}-${entry.status}`;
		if (!dedup.has(key)) {
			dedup.set(key, entry);
		}
	}
	return Array.from(dedup.values()).sort(
		(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
	);
}

export async function recordGuess(
	entry: GuessEntry,
	outputDir?: string,
): Promise<void> {
	const { cachePath, projectPath } = getPaths(entry.year, entry.day, outputDir);
	await appendEntry(cachePath, entry);
	await appendEntry(projectPath, entry);
}

export async function loadYearGuesses(
	year: string,
	outputDir?: string,
): Promise<Record<string, GuessEntry[]>> {
	const yearDir = path.join(CACHE_ROOT, year);
	let dayFiles: string[] = [];
	if (fs.existsSync(yearDir)) {
		dayFiles = fs
			.readdirSync(yearDir)
			.filter((file) => file.startsWith("day") && file.endsWith(".ndjson"));
	}
	const results: Record<string, GuessEntry[]> = {};
	for (const file of dayFiles) {
		const day = file.replace("day", "").replace(".ndjson", "");
		results[day] = await loadGuesses(year, day, outputDir);
	}
	return results;
}
