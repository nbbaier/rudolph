import type { Cardinal } from "./types";

/**
 * A map that associates arrow direction symbols with their corresponding
 * movement vectors. The keys are arrow symbols ("^", "v", ">", "<") and
 * the values are arrays representing the movement in a 2D grid.
 *
 * - "^" corresponds to moving up (0, -1)
 * - "v" corresponds to moving down (0, 1)
 * - ">" corresponds to moving right (1, 0)
 * - "<" corresponds to moving left (-1, 0)
 */
export const arrowDirections = new Map<string, number[]>([
	["^", [0, -1]],
	["v", [0, 1]],
	[">", [1, 0]],
	["<", [-1, 0]],
]);

export const rightTurnMap: Map<Cardinal, Cardinal> = new Map([
	["u", "r"],
	["r", "d"],
	["d", "l"],
	["l", "u"],
]);

export const leftTurnMap: Map<Cardinal, Cardinal> = new Map([
	["u", "l"],
	["l", "d"],
	["d", "r"],
	["r", "u"],
]);
