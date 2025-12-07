import { type GuessEntry, loadGuesses } from "../utils/guesses";

export async function guessesCommand(
	year: string,
	day: string,
	outputDir?: string,
	json?: boolean,
): Promise<void> {
	const entries = await loadGuesses(year, day, outputDir);
	if (json) {
		console.log(JSON.stringify(entries, null, 2));
		return;
	}
	if (!entries.length) {
		console.log(`No guesses recorded for ${year} day ${day}.`);
		return;
	}
	printTable(entries);
}

function printTable(entries: GuessEntry[]) {
	const header = ["Time (UTC)", "Part", "Answer", "Status", "Message"];
	console.log(header.join(" | "));
	console.log(header.map(() => "---").join(" | "));
	for (const g of entries) {
		console.log(
			[formatTime(g.timestamp), g.part, g.answer, g.status, g.message].join(
				" | ",
			),
		);
	}
}

function formatTime(timestamp: string) {
	const d = new Date(timestamp);
	return Number.isNaN(d.getTime())
		? timestamp
		: d.toISOString().replace("T", " ").replace("Z", " UTC");
}
