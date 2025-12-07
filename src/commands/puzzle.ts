import { loadFile } from "../utils";
import { buildDayPaths } from "../utils/cli-helpers";
import { downloadPuzzle } from "../utils/download";
import { fileExists } from "../utils/runtime";

export async function puzzleCommand(
	year: string,
	day: string,
	force: boolean,
	outputDir?: string,
	print = true,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	if (fileExists(paths.puzzle) && !force) {
		if (print) {
			console.log(loadFile(paths.puzzle));
		}
		return;
	}
	await downloadPuzzle(year, day, outputDir);
	if (print) {
		console.log(loadFile(paths.puzzle));
	}
}
