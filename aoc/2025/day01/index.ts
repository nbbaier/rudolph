function rotate(
	pos: number,
	r: string,
): { position: number; crossings: number } {
	const shift = r.at(0) === "R" ? Number(r.slice(1)) : -Number(r.slice(1));
	const newPos = pos + (shift % 100);

	const crossings =
		(Math.abs(shift) - Math.abs(shift % 100)) / 100 +
		((newPos < 0 || newPos > 100) && pos !== 0 ? 1 : 0);

	return newPos < 0
		? { position: newPos + 100, crossings }
		: newPos >= 100
			? { position: newPos - 100, crossings: crossings }
			: { position: newPos, crossings: crossings };
}

function part1(input: string): number | string {
	const rotations = input.trim().split("\n");

	let currentPos = 50;
	let total = 0;

	for (const r of rotations) {
		const { position } = rotate(currentPos, r);
		currentPos = position;
		if (position === 0) total += 1;
	}

	return total;
}

function part2(input: string): number | string {
	const rotations = input.trim().split("\n");

	let currentPos = 50;
	let total = 0;

	for (const r of rotations) {
		const { position, crossings } = rotate(currentPos, r);
		currentPos = position;
		if (position === 0) total += 1;
		total += crossings;
	}
	return total;
}
export default { p1: part1, p2: part2 };
