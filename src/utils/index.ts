import fs from "node:fs";
import path from "node:path";
import { Eta } from "eta";
import { getOutputDir } from "../env";
import { writeFile } from "./runtime";

export * from "./cli-helpers";

export function loadFile(filePath: string) {
	return fs.readFileSync(filePath).toString();
}

export function getDayPath(year: string, day: string, outputDir?: string): string {
	const dir = outputDir ?? getOutputDir();
	return path.join(dir, year, `day${day.padStart(2, "0")}`);
}

export async function createFromTemplate<
	TContext extends Record<string, unknown>,
>(template: string, targetPath: string, context?: TContext): Promise<void> {
	const eta = new Eta({
		views: path.resolve(import.meta.dirname, "templates"),
		autoEscape: false,
	});

	const output = eta.render(template, context || {});
	await writeFile(targetPath, output);
}
