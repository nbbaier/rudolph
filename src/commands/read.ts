import fs from "node:fs";
import { buildDayPaths } from "../utils/cli-helpers";
import { downloadPuzzle } from "../utils/download";

export async function readCommand(
	year: string,
	day: string,
	force: boolean,
): Promise<void> {
	const paths = buildDayPaths(year, day);

	if (fs.existsSync(paths.puzzle) && !force) {
		console.log(
			`Puzzle for ${year} day ${day} already exists (use --force to re-download)`,
		);
		return;
	}

	console.log(`Getting puzzle text for: ${year} day ${day}`);
	await downloadPuzzle(year, day);
}
