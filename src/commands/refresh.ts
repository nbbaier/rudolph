import { loadGuesses } from "../utils/guesses";
import { puzzleCommand } from "./puzzle";

export async function refreshCommand(
	year: string,
	day: string,
	force = false,
	outputDir?: string,
): Promise<void> {
	if (!force) {
		const guesses = await loadGuesses(year, day, outputDir);
		const hasPart1 = guesses.some(
			(g) =>
				g.part === "1" &&
				(g.status === "correct" || g.status === "already_completed"),
		);
		if (!hasPart1) {
			console.log(
				`Part 1 not recorded as complete for ${year} day ${day}. Use --force to refresh anyway.`,
			);
			return;
		}
	}
	console.log(`Refreshing puzzle for: ${year} day ${day}`);
	await puzzleCommand(year, day, true, outputDir, false);
}
