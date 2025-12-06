import { arrowDirections as directions } from "@/constants";

function part1(input: string): string | number {
	const instructions = input.trim().split("");
	const houses = new Set<string>(["0,0"]);

	let loc = [0, 0];

	for (const instruction of instructions) {
		const [dx, dy] = directions.get(instruction) as number[];
		loc = [loc[0] + dx, loc[1] + dy];
		const locKey = `${loc[0]},${loc[1]}`;
		houses.add(locKey);
	}

	return houses.size;
}

function part2(input: string): string | number {
	const instructions = input.trim().split("");
	const houses = new Set<string>(["0,0"]);

	let santa = [0, 0];
	let robo = [0, 0];

	for (let i = 0; i < instructions.length; i++) {
		const [dx, dy] = directions.get(instructions[i]) as number[];

		if ((i + 1) % 2 === 0) {
			robo = [robo[0] + dx, robo[1] + dy];
			const locKey = `${robo[0]},${robo[1]}`;
			houses.add(locKey);
		} else {
			santa = [santa[0] + dx, santa[1] + dy];
			const locKey = `${santa[0]},${santa[1]}`;
			houses.add(locKey);
		}
	}

	return houses.size;
}

export default { p1: part1, p2: part2 };
