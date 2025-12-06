function part1(input: string): number | string {
	const measurements = input.trim().split("\n").map(Number);

	let count = 0;

	for (let i = 1; i < measurements.length; i++) {
		const current = measurements[i];
		const previous = measurements[i - 1];
		count += current > previous ? 1 : 0;
	}
	return count;
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };
