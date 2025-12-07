import path from "node:path";
import type { Command } from "commander";
import { z } from "zod";
import { getOutputDir } from "../env";
import {
	InputNotFoundError,
	InvalidRunnerError,
	RunnerImportError,
	RunnerNotFoundError,
} from "../errors";
import { getDayPath, loadFile } from ".";
import { fileExists, isBun } from "./runtime";

export const daySchema = z
	.string()
	.regex(/^\d{1,2}$/)
	.transform((val) => val.padStart(2, "0"));
export const yearSchema = z.string().regex(/^\d{4}$/);

export function getDefaultDay(): string {
	return new Date().getDate().toString().padStart(2, "0");
}

export function getDefaultYear(): string {
	const now = new Date();
	const month = now.getMonth();
	const year = now.getFullYear();
	const defaultYear = month < 11 ? year - 1 : year;
	return process.env.AOC_YEAR ?? defaultYear.toString();
}

export interface DayYearOptions {
	outputDir?: string;
	force?: boolean;
	part?: "1" | "2" | "both";
}

export function withDayYearArguments(cmd: Command): Command {
	return cmd
		.argument("[year]", "Year (e.g., 2024)", getDefaultYear())
		.argument("[day]", "Day number (1-25)", getDefaultDay())
		.option("-o, --output-dir <dir>", "Output directory for generated files");
}

export function buildDayPaths(year: string, day: string, outputDir?: string) {
	const dir = outputDir ?? getOutputDir();
	const dayPath = getDayPath(year, day, dir);
	return {
		dayPath,
		runner: path.resolve(dayPath, "index.ts"),
		puzzle: path.resolve(dayPath, "puzzle.md"),
		test: path.resolve(dayPath, `day${day}.test.ts`),
		sample: path.resolve(dayPath, "sample.txt"),
		input: path.resolve(dayPath, "input.txt"),
		scratch: path.resolve(dayPath, "scratch.ts"),
	};
}

export interface RunnerModule {
	default: {
		p1: (input: string) => string | number;
		p2: (input: string) => string | number;
	};
}

export interface RunResult {
	p1?: string | number;
	p2?: string | number;
	elapsedMs: number;
}

function isValidRunner(mod: unknown): mod is RunnerModule {
	if (!mod || typeof mod !== "object") return false;
	const m = mod as Record<string, unknown>;
	if (!m.default || typeof m.default !== "object") return false;
	const def = m.default as Record<string, unknown>;
	return typeof def.p1 === "function" && typeof def.p2 === "function";
}

async function importRunner(runnerPath: string): Promise<RunnerModule> {
	if (isBun) {
		return import(runnerPath);
	}

	try {
		const { register } = await import("node:module");
		const { pathToFileURL } = await import("node:url");

		register("tsx/esm", pathToFileURL("./"));

		return import(runnerPath);
	} catch {
		return import(runnerPath);
	}
}

export async function executeRunner(
	runnerPath: string,
	inputPath: string,
	part: "1" | "2" | "both" = "both",
): Promise<RunResult> {
	if (!fileExists(runnerPath)) {
		throw new RunnerNotFoundError(runnerPath);
	}

	if (!fileExists(inputPath)) {
		throw new InputNotFoundError(inputPath);
	}

	let mod: unknown;
	try {
		mod = await importRunner(runnerPath);
	} catch (e) {
		throw new RunnerImportError(runnerPath, e instanceof Error ? e : undefined);
	}

	if (!isValidRunner(mod)) {
		throw new InvalidRunnerError(runnerPath);
	}

	const runner = mod.default;
	const input = loadFile(inputPath);
	const start = performance.now();
	let p1: string | number | undefined;
	let p2: string | number | undefined;
	if (part === "1" || part === "both") {
		p1 = runner.p1(input);
	}
	if (part === "2" || part === "both") {
		p2 = runner.p2(input);
	}
	const end = performance.now();
	return { p1, p2, elapsedMs: end - start };
}

export async function runSolution(
	runnerPath: string,
	inputPath: string,
	showTiming: boolean,
	part: "1" | "2" | "both" = "both",
): Promise<void> {
	const result = await executeRunner(runnerPath, inputPath, part);
	if (part === "both") {
		console.log({ p1: result.p1, p2: result.p2 });
	} else if (part === "1") {
		console.log({ p1: result.p1 });
	} else {
		console.log({ p2: result.p2 });
	}
	if (showTiming) {
		console.log(`\nTime: ${result.elapsedMs.toFixed(2)}ms`);
	}
}
