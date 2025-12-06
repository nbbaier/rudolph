import { checkCorners } from "./checkCorners";
import { checkXMAS } from "./checkXMAS";

export const directions = {
	r: { dx: 1, dy: 0 }, // right
	l: { dx: -1, dy: 0 }, // left
	d: { dx: 0, dy: 1 }, // down
	u: { dx: 0, dy: -1 }, // up
	ur: { dx: 1, dy: -1 }, // up-right
	dl: { dx: -1, dy: 1 }, // down-left
	dr: { dx: 1, dy: 1 }, // down-right
	ul: { dx: -1, dy: -1 }, // up-left
};

function part1(input: string): number | string {
	const grid = input
		.trim()
		.split("\n")
		.map((line) => line.split(""));

	let xmasCount = 0;
	const rows = grid.length;
	const cols = grid[0].length;

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			// console.log(`Checking [${x}, ${y}]`);
			for (const dir of Object.values(directions)) {
				if (checkXMAS(grid, { x, y }, dir, rows, cols)) {
					xmasCount += 1;
				}
			}
		}
	}

	return xmasCount;
}

function part2(input: string): number | string {
	const grid = input
		.trim()
		.split("\n")
		.map((line) => line.split(""));

	let xmasCount = 0;
	const rows = grid.length;
	const cols = grid[0].length;

	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			if (grid[y][x] === "A") {
				xmasCount += checkCorners(grid, { x, y }, rows, cols) ? 1 : 0;
			}
		}
	}
	return xmasCount;
}

export default { p1: part1, p2: part2 };
