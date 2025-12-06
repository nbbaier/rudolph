import { downloadPuzzle } from "../utils/download";

export async function refreshCommand(year: string, day: string): Promise<void> {
	console.log(`Refreshing puzzle for: ${year} day ${day}`);
	await downloadPuzzle(year, day);
}
