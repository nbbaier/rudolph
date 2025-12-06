function part1(input: string): number | string {
	const programs = input.replace(/\r/g, "").trim();
	const regex = /mul\((\d+,\d+)\)/g;
	const matches = Array.from(programs.matchAll(regex));
	return matches
		.map((match) => {
			return match[1].split(",").map((n) => Number.parseFloat(n));
		})
		.reduce((a, [l, r]) => {
			return a + l * r;
		}, 0);
}

function part2(input: string): number | string {
	const programs = input.replace(/\r/g, "").trim();
	const regex = /mul\((\d+,\d+)\)|(do)\(\)|(don't)\(\)/g;
	const matches = Array.from(programs.matchAll(regex));

	const instructions = matches.map((match) => {
		return match[0].includes("mul")
			? match[1].split(",").map((n) => Number.parseFloat(n))
			: match[0];
	});

	let add = true;

	return instructions.reduce((acc, ins) => {
		if (typeof ins !== "string" && add) {
			return acc + ins[0] * ins[1];
		}
		if (ins === "do()") {
			add = true;
			return acc;
		}
		if (ins === "don't()") {
			add = false;
			return acc;
		}
		return acc;
	}, 0);
}

export default { p1: part1, p2: part2 };
