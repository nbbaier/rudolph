import { fetchYearStars } from "../utils/stars";

export async function statusCommand(
	year: string,
	json?: boolean,
): Promise<void> {
	const summary = await fetchYearStars(year);
	if (json) {
		console.log(JSON.stringify(summary, null, 2));
		return;
	}
	if (!summary.days.length) {
		console.log(`No puzzles unlocked for ${year} yet.`);
		return;
	}
	for (const entry of summary.days) {
		console.log(`Day ${entry.day}: ${entry.display}`);
	}
	console.log(`Total stars: ${summary.total}/${summary.maxStars}`);
}
