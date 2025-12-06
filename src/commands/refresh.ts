import { readCommand } from "./read";

export async function refreshCommand(
	year: string,
	day: string,
	outputDir?: string,
): Promise<void> {
	console.log(`Refreshing puzzle for: ${year} day ${day}`);
	await readCommand(year, day, true, outputDir);
}
