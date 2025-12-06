/**
 * Calculates the surface area of a box.
 *
 * @param box - An object representing the dimensions of the box.
 * @param box.l - The length of the box.
 * @param box.w - The width of the box.
 * @param box.h - The height of the box.
 * @returns The total surface area of the box.
 */
function calcSurfaceArea(box: { l: number; w: number; h: number }): number {
	return 2 * (box.l * box.w + box.w * box.h + box.h * box.l);
}

/**
 * Calculates the slack required for a given box.
 * The slack is defined as the area of the smallest side of the box.
 *
 * @param box - An object representing the dimensions of the box.
 * @param box.l - The length of the box.
 * @param box.w - The width of the box.
 * @param box.h - The height of the box.
 * @returns The area of the smallest side of the box.
 */
function calcSlack(box: { l: number; w: number; h: number }): number {
	return [box.l * box.w, box.w * box.h, box.h * box.l].sort((a, b) => a - b)[0];
}

/**
 * Calculates the smallest perimeter of any one face of a box.
 * The perimeter is calculated by taking the two smallest dimensions,
 * summing them, and then multiplying by 2.
 *
 * @param box - An object representing the dimensions of the box with properties `l` (length), `w` (width), and `h` (height).
 * @returns The smallest perimeter of any one face of the box.
 */
function calcPerimeter(box: { l: number; w: number; h: number }): number {
	return Object.values(box)
		.sort((a, b) => a - b)
		.slice(0, 2)
		.reduce((a, c) => {
			return a + 2 * c;
		}, 0);
}

/**
 * Calculates the bow required for a given box.
 * The bow is determined by multiplying the length, width, and height of the box.
 *
 * @param box - An object representing the dimensions of the box.
 * @param box.l - The length of the box.
 * @param box.w - The width of the box.
 * @param box.h - The height of the box.
 * @returns The calculated bow as a number.
 */
function calcBow(box: { l: number; w: number; h: number }): number {
	return Object.values(box).reduce((a, c) => {
		return a * c;
	}, 1);
}

function part1(input: string): number | string {
	const boxes = input
		.trim()
		.split("\n")
		.map((line) => {
			const [l, w, h] = line.split("x").map(Number);
			return { l, w, h };
		});

	const sqft = boxes.map((box) => calcSurfaceArea(box) + calcSlack(box));

	return sqft.reduce((a, c) => a + c, 0);
}

function part2(input: string): number | string {
	const boxes = input
		.trim()
		.split("\n")
		.map((line) => {
			const [l, w, h] = line.split("x").map(Number);
			return { l, w, h };
		});

	return boxes
		.map((box) => calcBow(box) + calcPerimeter(box))
		.reduce((a, c) => a + c);
}

export default { p1: part1, p2: part2 };
