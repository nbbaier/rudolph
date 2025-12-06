import { dropOne } from "@/utils";

function parse(input: string) {
	return input
		.trim()
		.split("\n")
		.map((r) => r.split(" ").map((i) => Number.parseInt(i, 10)));
}

/**
 * Checks if the given report array follows a specific pattern.
 * The pattern is defined as the difference between consecutive elements
 * being either -1, -2, -3, 1, 2, or 3, and all differences must be in the same direction.
 *
 * @param report - An array of numbers representing the report.
 * @returns `true` if the report follows the pattern, `false` otherwise.
 */
function checkReport(report: number[]): boolean {
	const directions: string[] = [];

	for (let i = 0; i < report.length - 1; i++) {
		const diff = report[i] - report[i + 1];

		if (Math.abs(diff) < 1 || Math.abs(diff) > 3) {
			return false;
		}

		directions.push(diff < 0 ? "down" : "up");
	}

	return new Set(directions).size === 1;
}

function part1(input: string): number | string {
	const reports = parse(input);

	let count = 0;

	for (const report of reports) {
		const safe = checkReport(report);
		safe ? count++ : null;
	}

	return count;
}

function part2(input: string): number | string {
	const reports = parse(input);

	let count = 0;

	for (const report of reports) {
		const safe = checkReport(report);
		if (safe) {
			count++;
		} else {
			const altReports = dropOne(report);
			const altResults = [];
			for (const altReport of altReports) {
				altResults.push(checkReport(altReport));
			}
			altResults.some(Boolean) ? count++ : null;
		}
	}

	return count;
}

export default { p1: part1, p2: part2 };
