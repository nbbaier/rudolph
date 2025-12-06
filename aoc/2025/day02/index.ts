import { range, repeatedSubstring } from "@/utils";

function part1(input: string): number | string {
	const ids = input
		.trim()
		.split(",")
		.map((r) => r.split("-").map((n) => Number(n)))
		.flatMap((r) => range(r[0], r[1]))
		.map(String);

	return ids
		.map((s) => {
			const middle = Math.floor(s.length / 2);
			return [s, s.substring(0, middle) === s.substring(middle)];
		})
		.filter((s) => Boolean(s[1]))
		.reduce((a, c) => a + Number(c[0]), 0);
}

function part2(input: string): number | string {
	const ids = input
		.trim()
		.split(",")
		.map((r) => r.split("-").map((n) => Number(n)))
		.flatMap((r) => range(r[0], r[1]))
		.map(String);

	return ids
		.filter(repeatedSubstring)
		.map(Number)
		.reduce((a, c) => a + c, 0);
}

export default { p1: part1, p2: part2 };
