import type { Board, Point } from "@/types";

/**
 * Sorts the given points into quadrants based on their positions on the board.
 * The board is divided into four quadrants: top-left, top-right, bottom-left, and bottom-right.
 * Points that fall exactly on the middle row or column are not included in any quadrant.
 *
 * @param board - The board object containing the num`ber of rows and columns.
 * @param points - An array of points to be sorted, where each point has x and y coordinates.
 * @returns A Map where the keys are quadrant names (e.g., "top-left") and the values are arrays of points in that quadrant.
 */
export function sortQudrants(board: Board, points: Point[]) {
	const middleRow = Math.floor(board.rows / 2);
	const middleCol = Math.floor(board.cols / 2);

	const isTopBottom = (y: number) => {
		if (y >= 0 && y < middleRow) {
			return "top";
		}
		if (y > middleRow && y < board.rows) {
			return "bottom";
		}
		return "middle";
	};

	const isLeftRight = (x: number) => {
		if (x >= 0 && x < middleCol) {
			return "left";
		}
		if (x > middleCol && x < board.cols) {
			return "right";
		}
		return "middle";
	};

	const sorted = new Map<string, string[]>();

	for (const { x, y } of points) {
		const point = `(${x},${y})`;
		const q = `${isTopBottom(y)}-${isLeftRight(x)}`;
		if (!sorted.get(q) && !q.includes("middle")) {
			sorted.set(q, []);
			sorted.get(q)?.push(point);
		} else sorted.get(q)?.push(point);
	}

	return sorted;
}
