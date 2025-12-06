function parse(input: string) {
	const [patterns, _, ...designs] = input.trim().split("\n");
	return [
		patterns.split(",").map((d) => d.trim()),
		designs.map((d) => d.trim()),
	];
}

function isValidDesign(design: string, patterns: string[]): boolean {
	if (design.length === 0) {
		return true;
	}
	for (const pattern of patterns) {
		if (design.startsWith(pattern)) {
			const remainder = design.slice(pattern.length);
			if (isValidDesign(remainder, patterns)) return true;
		}
	}
	return false;
}

function countValidDesigns(
	design: string,
	patterns: string[],
	memo: Map<string, number> = new Map(),
): number {
	if (memo.has(design)) {
		const result = memo.get(design);
		if (result !== undefined) {
			return result;
		}
	}

	if (design.length === 0) {
		return 1;
	}

	let count = 0;
	for (const pattern of patterns) {
		if (design.startsWith(pattern)) {
			count += countValidDesigns(design.slice(pattern.length), patterns, memo);
		}
	}

	memo.set(design, count);
	return count;
}

function part1(input: string): number | string {
	const [patterns, designs] = parse(input);

	let valid = 0;
	for (const design of designs) {
		valid += isValidDesign(design, patterns) ? 1 : 0;
	}

	return valid;
}

function part2(input: string): number | string {
	const [patterns, designs] = parse(input);

	let valid = 0;

	for (const design of designs) {
		valid += countValidDesigns(design, patterns);
	}

	return valid;
}

export default { p1: part1, p2: part2 };
