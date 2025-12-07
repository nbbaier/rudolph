import { type GuessEntry, loadYearGuesses } from "../utils/guesses";

function isCompleteStatus(status: string) {
	return status === "correct" || status === "already_completed";
}

function dayStars(entries: string[]) {
	if (entries.includes("2")) return "★★";
	if (entries.includes("1")) return "★☆";
	return "☆☆";
}

function buildStatusSummary(data: Record<string, GuessEntry[]>): {
	days: Array<{ day: string; stars: string; last: GuessEntry | null }>;
	total: number;
} {
	const days = Object.keys(data).sort((a, b) => Number(a) - Number(b));
	let total = 0;
	const entries = days.map((day) => {
		const guesses = data[day];
		const completedParts = guesses
			.filter((g) => isCompleteStatus(g.status))
			.map((g) => g.part);
		const stars = dayStars(completedParts);
		total += stars === "★★" ? 2 : stars === "★☆" ? 1 : 0;
		const last = guesses[guesses.length - 1] ?? null;
		return { day, stars, last };
	});
	return { days: entries, total };
}

export async function statusCommand(
	year: string,
	outputDir?: string,
	json?: boolean,
): Promise<void> {
	const all = await loadYearGuesses(year, outputDir);
	const summary = buildStatusSummary(all);
	if (json) {
		console.log(JSON.stringify(summary, null, 2));
		return;
	}
	if (!summary.days.length) {
		console.log(`No guesses recorded for ${year} yet.`);
		return;
	}
	for (const entry of summary.days) {
		if (!entry.last) {
			console.log(`Day ${entry.day}: ${entry.stars} (no submissions yet)`);
		} else {
			console.log(
				`Day ${entry.day}: ${entry.stars} (last: ${entry.last.status} @ ${entry.last.timestamp})`,
			);
		}
	}
	console.log(`Total stars: ${summary.total}`);
}
