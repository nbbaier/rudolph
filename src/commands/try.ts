import type { DayYearOptions } from "../utils/cli-helpers";
import { buildDayPaths, runSolution } from "../utils/cli-helpers";

export async function tryCommand(
	year: string,
	day: string,
	outputDir?: string,
	part: DayYearOptions["part"] = "both",
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	await runSolution(paths.runner, paths.sample, false, part);
}
