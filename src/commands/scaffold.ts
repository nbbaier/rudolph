import fs from "node:fs";
import { createFromTemplate } from "../utils";
import { buildDayPaths } from "../utils/cli-helpers";
import { downloadInput, downloadPuzzle } from "../utils/download";

export async function scaffoldCommand(
	year: string,
	day: string,
	force: boolean,
): Promise<void> {
	const paths = buildDayPaths(year, day);

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
	await Bun.write(paths.sample, "");
	await downloadInput(year, day);
	await downloadPuzzle(year, day);
	console.log(`Scaffolding complete (don't forget to add sample data)`);
}
