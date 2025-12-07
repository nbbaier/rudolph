import { buildDayPaths } from "../utils/cli-helpers";
import { downloadInput } from "../utils/download";
import { fileExists } from "../utils/runtime";

export async function inputCommand(
	year: string,
	day: string,
	force: boolean,
	outputDir?: string,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	if (fileExists(paths.input) && !force) {
		console.log(
			`Input for ${year} day ${day} already exists (use --force to re-download)`,
		);
		return;
	}
	await downloadInput(year, day, outputDir);
}
