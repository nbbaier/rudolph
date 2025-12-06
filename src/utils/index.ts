import fs from "node:fs";
import path from "node:path";
import { Eta } from "eta";

export * from "./cli-helpers";
export * from "./solutions";

/**
 * Reads the content of a file synchronously and returns it as a string.
 *
 * @param filePath - The path to the file to be read.
 * @returns The content of the file as a string.
 */
export function loadFile(filePath: string) {
	return fs.readFileSync(filePath).toString();
}

/**
 * Generates the file path for a specific day's challenge in the Advent of Code event.
 *
 * @param year - The year of the Advent of Code event.
 * @param day - The day of the challenge within the event.
 * @returns The file path string for the specified day's challenge.
 */
export function getDayPath(year: string, day: string): string {
	return `./aoc/${year}/day${day.padStart(2, "0")}`;
}

/**
 * Asynchronously creates a file from an Eta template.
 *
 * @param template - The name of the template file (without extension) located in the "./aoc/templates" directory.
 * @param targetPath - The path where the generated file should be written.
 * @param context - An object containing variables to pass to the template.
 * @returns A promise that resolves when the file has been written.
 */
export async function createFromTemplate<
	TContext extends Record<string, unknown>,
>(template: string, targetPath: string, context?: TContext): Promise<void> {
	const eta = new Eta({
		views: path.resolve(import.meta.dirname, "../templates"),
		autoEscape: false,
	});

	const output = eta.render(template, context || {});
	await Bun.write(targetPath, output);
}
