import { createRunnerFile } from "../utils";
import { buildDayPaths } from "../utils/cli-helpers";
import { downloadInput, downloadPuzzle } from "../utils/download";
import { ensureDirectory, fileExists, writeFile } from "../utils/runtime";

export async function setupCommand(
	year: string,
	day: string,
	force: boolean,
	outputDir?: string,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);

	if (fileExists(paths.runner) && !force) {
		console.log(
			`Day exists: ${year} day ${day} (use --force to re-setup; this may overwrite files)`,
		);
		return;
	}

	console.log(`Setting up: ${year} day ${day}`);

	await ensureDirectory(paths.runner);
	await createRunnerFile(paths.runner);
	await writeFile(paths.sample, "");
	await downloadInput(year, day, outputDir);
	await downloadPuzzle(year, day, outputDir);
	console.log("Setup complete (sample data is empty by default)");
}
