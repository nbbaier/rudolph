import { buildDayPaths } from "../utils/cli-helpers";
import { downloadPuzzle } from "../utils/download";
import { fileExists } from "../utils/runtime";

export async function readCommand(
	year: string,
	day: string,
	force: boolean,
	outputDir?: string,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);

	if (fileExists(paths.puzzle) && !force) {
		console.log(
			`Puzzle for ${year} day ${day} already exists (use --force to re-download)`,
		);
		return;
	}

	console.log(`Getting puzzle text for: ${year} day ${day}`);
	await downloadPuzzle(year, day, outputDir);
}
