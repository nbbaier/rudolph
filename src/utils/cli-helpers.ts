import path from "node:path";
import { z } from "zod";
import { getDayPath, loadFile } from ".";

export const daySchema = z
	.string()
	.regex(/^\d{1,2}$/)
	.transform((val) => val.padStart(2, "0"));
export const yearSchema = z.string().regex(/^\d{4}$/);

export function getDefaultDay(): string {
	return new Date().getDate().toString().padStart(2, "0");
}

export function getDefaultYear(): string {
	return new Date().getFullYear().toString();
}

export function buildDayPaths(year: string, day: string) {
	const dayPath = getDayPath(year, day);
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

export async function runSolution(
	runnerPath: string,
	inputPath: string,
	showTiming: boolean,
): Promise<void> {
	const runner = (await import(runnerPath)) as {
		default: {
			p1: (input: string) => string | number;
			p2: (input: string) => string | number;
		};
	};

	const start = performance.now();
	const input = loadFile(inputPath);
	const p1 = runner.default.p1(input);
	const p2 = runner.default.p2(input);
	const end = performance.now();

	console.log({ p1, p2 });
	if (showTiming) {
		console.log(`\nTime: ${end - start}ms`);
	}
}
