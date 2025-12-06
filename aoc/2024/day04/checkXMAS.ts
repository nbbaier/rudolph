import type { Direction, Point } from "@/types";
import { checkOutOfBounds } from "@/utils";

/**
 * Checks if the string "XMAS" can be found in the grid starting from a given point and moving in a specified direction.
 *
 * @param grid - A 2D array of strings representing the grid.
 * @param start - The starting point in the grid.
 * @param dir - The direction to move in the grid.
 * @param rows - The number of rows in the grid.
 * @param cols - The number of columns in the grid.
 * @returns `true` if "XMAS" is found in the grid starting from the given point and moving in the specified direction, otherwise `false`.
 */
export function checkXMAS(
	grid: string[][],
	start: Point,
	dir: Direction,
	rows: number,
	cols: number,
): boolean {
	const target = "XMAS";

	const endX = start.x + dir.dx;
	const endY = start.y + dir.dy;

	if (checkOutOfBounds(endX, endY, rows, cols)) {
		return false;
	}
	for (let i = 0; i < target.length; i++) {
		const currentX = start.x + dir.dx * i;
		const currentY = start.y + dir.dy * i;
		if (checkOutOfBounds(currentX, currentY, rows, cols)) {
			return false;
		}
		if (grid[currentY][currentX] !== target[i]) {
			return false;
		}
	}

	return true;
}
