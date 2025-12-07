import type { DayYearOptions } from "../utils/cli-helpers";
import { buildDayPaths, runSolution } from "../utils/cli-helpers";

export type RunTarget = "sample" | "input";

export async function runCommand(
	year: string,
	day: string,
	target: RunTarget,
	outputDir?: string,
	part: DayYearOptions["part"] = "both",
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	const inputPath = target === "sample" ? paths.sample : paths.input;
	await runSolution(paths.runner, inputPath, true, part);
}
