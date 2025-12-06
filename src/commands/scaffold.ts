import fs from "node:fs";
import { createFromTemplate } from "../utils";
import { buildDayPaths } from "../utils/cli-helpers";
import { downloadInput, downloadPuzzle } from "../utils/download";
import { writeFile } from "../utils/runtime";

export async function scaffoldCommand(
	year: string,
	day: string,
	force: boolean,
	outputDir?: string,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);

	if (fs.existsSync(paths.runner) && !force) {
		console.log(`Day exists: ${year} day ${day} (use --force to re-scaffold)`);
		return;
	}

	console.log(`Scaffolding: ${year} day ${day}`);

	await createFromTemplate("runner", paths.runner);
	await createFromTemplate("tests", paths.test, {
		day,
		year,
	});
	await writeFile(paths.sample, "");
	await downloadInput(year, day, outputDir);
	await downloadPuzzle(year, day, outputDir);
	console.log(`Scaffolding complete (don't forget to add sample data)`);
}
