import { buildDayPaths, runSolution } from "@/utils/cli-helpers";

export async function tryCommand(year: string, day: string): Promise<void> {
	const paths = buildDayPaths(year, day);
	await runSolution(paths.runner, paths.sample, false);
}
