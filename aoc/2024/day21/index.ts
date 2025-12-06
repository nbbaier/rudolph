import type { Point } from "@/types";
import { checkOutOfBounds, getNeighbors } from "@/utils";

function createGrid(
	input: string,
	fn: (cell: string) => boolean = (_cell) => true,
) {
	const data: string[][] = input
		.trim()
		.split("\n")
		.map((line) => line.split(""));

	const grid = new Map<string, string>();

	for (let y = 0; y < data.length; y++) {
		for (let x = 0; x < data[0].length; x++) {
			const value = JSON.stringify({ x, y }); //`${x},${y}`;
			const key = data[y][x];

			if (fn(key)) {
				if (!grid.get(key)) {
					grid.set(key, value);
				}
			}
		}
	}

	return grid;
}

const _numPad = createGrid("789\n456\n123\n.0A", (cell) => cell !== ".");
const _dirPad = createGrid(".^A\n<v>", (cell) => cell !== ".");

function part1(input: string): number | string {
	const codes = input.trim().split("\n");

	return codes[0];
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };

function _findPaths(
	start: Point,
	end: Point,
	rows: number,
	cols: number,
): Point[][] {
	const paths: Point[][] = [];
	const visited = new Set<string>();

	function dfs(current: Point, path: Point[]) {
		const key = JSON.stringify(current);

		if (current.x === end.x && current.y === end.y) {
			paths.push([...path]);
			return;
		}

		visited.add(key);

		const neighbors = getNeighbors(current).filter(
			(p) =>
				!checkOutOfBounds(p.x, p.y, rows, cols) &&
				!visited.has(JSON.stringify(p)),
		);

		for (const next of neighbors) {
			path.push(next);
			dfs(next, path);
			path.pop();
		}

		visited.delete(key);
	}

	dfs(start, [start]);

	return paths;
}
