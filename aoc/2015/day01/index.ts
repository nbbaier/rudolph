const symbolMap = new Map([
	["(", 1],
	[")", -1],
]);

function part1(input: string): number | string {
	return input
		.split("")
		.map((sym) => symbolMap.get(sym) ?? 0)
		.reduce((a, c) => a + c, 0);
}

function part2(input: string): number | string {
	const instructions = input.split("").map((sym) => symbolMap.get(sym) ?? 0);

	let floor = 0;
	let answer = 0;

	for (let i = 0; i < instructions.length; i++) {
		floor += instructions[i];
		if (floor === -1) {
			answer = i;
			break;
		}
	}

	return answer + 1;
}

export default { p1: part1, p2: part2 };
