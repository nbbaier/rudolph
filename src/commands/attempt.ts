import { buildDayPaths, runSolution } from "../utils/cli-helpers";

export async function attemptCommand(
	year: string,
	day: string,
	outputDir?: string,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	await runSolution(paths.runner, paths.input, true);
}
