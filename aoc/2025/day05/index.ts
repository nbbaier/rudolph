function mergeRanges(ranges: number[][]): number[][] {
	if (ranges.length === 0) return [];
	const sorted = ranges.sort((a, b) => a[0] - b[0]);
	const merged: [number, number][] = [];
	for (const [start, end] of sorted) {
		if (merged.length && start <= merged[merged.length - 1][1] + 1) {
			merged[merged.length - 1][1] = Math.max(
				merged[merged.length - 1][1],
				end,
			);
		} else {
			merged.push([start, end]);
		}
	}

	return merged;
}

function part1(input: string): number | string {
	const [rangeStrings, ingredients] = input
		.split("\n\n")
		.map((line) => line.split("\n"));

	const ranges = rangeStrings.map((r) => r.split("-").map(Number));
	const fresh = ingredients.map((i) => {
		const n = Number(i);
		return ranges.map((r) => n >= r[0] && n <= r[1]).some(Boolean);
	});

	return fresh.filter(Boolean).length;
}

function part2(input: string): number | string {
	const [rangeStrings] = input.split("\n\n").map((line) => line.split("\n"));
	const ranges = rangeStrings
		.map((r) => r.trim())
		.filter(Boolean)
		.map((r) => r.split("-").map(Number));
	const merged = mergeRanges(ranges);
	const totalUnique = merged.reduce<bigint>(
		(sum, [start, end]) => sum + (BigInt(end) - BigInt(start) + 1n),
		0n,
	);
	return Number(totalUnique);
}

export default { p1: part1, p2: part2 };
