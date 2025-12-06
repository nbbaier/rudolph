function part1(input: string): number | string {
	const strings = input.trim().split("\n");

	let nice = 0;
	for (const testString of strings) {
		nice +=
			// has at least three vowels
			(testString.match(/[aeiou]/g) || []).length >= 3 &&
			// has at least one double letter
			(testString.match(/([a-z])\1/g) || []).length >= 1 &&
			// does not contain ab, cd, pq, or xy
			(testString.match(/(ab|cd|pq|xy)/g) || []).length === 0
				? 1
				: 0;
	}
	return nice;
}

function part2(input: string): number | string {
	const strings = input.trim().split("\n");
	let nice = 0;
	for (const testString of strings) {
		// contains a pair of any two letters that appears at least twice in the string without overlapping
		const condition1: Set<string> = new Set(
			testString.matchAll(/(?=(\w{2}).*\1)/gm).map((match) => match[1]),
		);

		// contains at least one letter which repeats with exactly one letter between them
		const condition2: Set<string> = new Set(
			testString.matchAll(/(?=.*?(\w).\1)/gm).map((match) => match[1]),
		);

		nice += condition1.size >= 1 && condition2.size >= 1 ? 1 : 0;
	}
	return nice;
}

export default { p1: part1, p2: part2 };
