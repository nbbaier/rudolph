import type { Point } from "@/types";
import { checkOutOfBounds } from "@/utils";
import { directions } from ".";

/**
 * Checks if the corners of a specified region in a grid meet certain conditions.
 *
 * @param grid - A 2D array of strings representing the grid.
 * @param start - The starting point of the region to check.
 * @param rows - The number of rows in the grid.
 * @param cols - The number of columns in the grid.
 * @returns A boolean indicating whether the corners of the region meet the conditions.
 */
export function checkCorners(
	grid: string[][],
	start: Point,
	rows: number,
	cols: number,
): boolean {
	const _region: string[][] = [];
	const corners = Object.fromEntries(
		Object.entries(directions).filter(([k, _v]) => k.length === 2),
	);

	for (const corner of Object.entries(corners)) {
		const endX = start.x + corner[1].dx;
		const endY = start.y + corner[1].dy;
		if (checkOutOfBounds(endX, endY, rows, cols)) {
			return false;
		}
	}

	const lrDiag = `${grid[start.y + corners.ur.dy][start.x + corners.ur.dx]}${grid[start.y + corners.dl.dy][start.x + corners.dl.dx]}`;
	const rlDiag = `${grid[start.y + corners.ul.dy][start.x + corners.ul.dx]}${grid[start.y + corners.dr.dy][start.x + corners.dr.dx]}`;

	return ["MS", "SM"].includes(lrDiag) && ["MS", "SM"].includes(rlDiag);
}
