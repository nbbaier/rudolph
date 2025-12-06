function parse(input: string) {
	return input.trim().split("\n").map(Number);
}

function part1(input: string): number | string {
	const arr = parse(input);
	const target = 2020;
	const answer: number[] = [];
	for (const n of arr) {
		const diff = target - n;
		if (arr.includes(diff)) {
			answer.push(n);
			answer.push(diff);
			break;
		}
	}
	return answer.reduce((a, c) => a * c, 1);
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };
