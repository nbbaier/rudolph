import { rightTurnMap } from "@/constants";
import type { Cardinal, DirectionSet, Point } from "@/types";

/**
 * A set of directions for movement in a 2D grid, excluding diagonal directions.
 *
 * The directions included are:
 * - `r` (right): Moves right by increasing the x-coordinate by 1.
 * - `l` (left): Moves left by decreasing the x-coordinate by 1.
 * - `d` (down): Moves down by increasing the y-coordinate by 1.
 * - `u` (up): Moves up by decreasing the y-coordinate by 1.
 *
 * @type {Omit<DirectionSet, "ur" | "dl" | "dr" | "ul">}
 */
const directions: Omit<DirectionSet, "ur" | "dl" | "dr" | "ul"> = {
	r: { dx: 1, dy: 0 }, // Move right: increase x by 1
	l: { dx: -1, dy: 0 }, // Move left: decrease x by 1
	d: { dx: 0, dy: 1 }, // Move down: increase y by 1
	u: { dx: 0, dy: -1 }, // Move up: decrease y by 1
};

/**
 * Represents the state of a guard in the system.
 *
 * @interface GuardState
 * @property {Point} position - The current position of the guard.
 * @property {Cardinal} facing - The direction the guard is currently facing.
 * @property {Point[]} visited - An array of points that the guard has visited.
 */
interface GuardState {
	position: Point;
	facing: Cardinal;
	visited: Point[];
}

/**
 * Represents a cell in a grid or map.
 *
 * @interface Cell
 * @property {Point} coord - The coordinates of the cell.
 * @property {boolean} obstacle - Indicates if the cell is an obstacle.
 * @property {string} raw - The raw string representation of the cell.
 */
interface Cell {
	coord: Point;
	obstacle: boolean;
	raw: string;
}

/**
 * Represents a laboratory with specific dimensions and a collection of cells.
 *
 * @typedef {Object} Lab
 * @property {Object} dimensions - The dimensions of the lab.
 * @property {number} dimensions.rows - The number of rows in the lab.
 * @property {number} dimensions.cols - The number of columns in the lab.
 * @property {Map<string, Cell>} cells - A map of cell identifiers to Cell objects.
 */
type Lab = {
	dimensions: { rows: number; cols: number };
	cells: Map<string, Cell>;
};

/**
 * Creates a Lab object from a given grid.
 *
 * @param {Object} param - The parameter object.
 * @param {string[][]} param.grid - A 2D array representing the grid of the lab.
 * @returns {Lab} The created Lab object.
 */
function createLab({ grid }: { grid: string[][] }): Lab {
	const lab: Lab = {
		dimensions: { rows: grid.length, cols: grid[0].length },
		cells: new Map<string, Cell>(),
	};
	for (let y = 0; y < grid.length; y++) {
		const row = grid[y];
		for (let x = 0; x < row.length; x++) {
			const key = `${x},${y}`;
			lab.cells.set(key, {
				coord: { x, y },
				obstacle: row[x] === "#",
				raw: row[x],
			});
		}
	}
	return lab;
}

/**
 * Initializes the guard's state in the lab.
 *
 * This function locates the starting position of the guard, which is marked by the "^" symbol
 * in the lab's cells. It then sets the guard's initial position, an empty list of visited cells,
 * and the initial facing direction to "up".
 *
 * @param {Lab} lab - The lab object containing the cells and their states.
 * @returns {GuardState} The initial state of the guard, including position, visited cells, and facing direction.
 */
function initializeGuard(lab: Lab): GuardState {
	const [key, _] = Array.from(lab.cells.entries()).find(
		([_, cell]) => cell.raw === "^",
	) as [string, Cell];
	const [x, y] = key.split(",").map(Number);
	const startPoint = { x, y };
	return { position: startPoint, visited: [], facing: "u" };
}

/**
 * Simulates a guard taking a turn in the lab.
 *
 * @param guard - The current state of the guard.
 * @param lab - The current state of the lab.
 * @returns An object containing the updated guard state, lab state, and a boolean indicating if the guard is still on.
 *
 * The function handles three scenarios:
 * 1. If the guard would move off the lab, it updates the guard's visited cells and returns with `on` set to false.
 * 2. If the next cell is empty, it moves the guard forward, updates the visited cells, and returns with `on` set to true.
 * 3. If the guard hits an obstacle, it rotates the guard 90 degrees clockwise and returns with `on` set to true.
 *
 * @throws Will throw an error if the guard's facing direction is invalid.
 */
function takeTurn(
	guard: GuardState,
	lab: Lab,
): {
	guard: GuardState;
	lab: Lab;
	on: boolean;
} {
	const startPoint = guard.position;
	const startKey = `${startPoint.x},${startPoint.y}`;
	const startCell = lab.cells.get(startKey) as Cell;
	const direction = directions[guard.facing as keyof typeof directions];

	if (!direction) {
		throw new Error(`Invalid facing direction: ${guard.facing}`);
	}

	const newPoint = {
		x: startPoint.x + direction.dx,
		y: startPoint.y + direction.dy,
	};
	const newKey = `${newPoint.x},${newPoint.y}`;
	const nextCell = lab.cells.get(newKey);

	// Handle three possible scenarios:
	// 1. Guard would move off the lab
	if (typeof nextCell === "undefined") {
		guard.visited.push(startCell.coord);
		return { guard, lab, on: false };
	}

	// 2. Next cell is empty - move forward
	if (!nextCell.obstacle) {
		guard.visited.push(startCell.coord);
		guard.position = newPoint;
		return { guard, lab, on: true };
	}

	// 3. Hit an obstacle - rotate 90 degrees clockwise
	guard.facing = rightTurnMap.get(guard.facing) as Cardinal;
	return { guard, lab, on: true };
}

function part1(input: string): number | string {
	const grid = input
		.trim()
		.split("\n")
		.map((line) => line.split(""));

	let labState = createLab({ grid });
	let guardState = initializeGuard(labState);
	let onState = true;

	while (onState) {
		const turnOutcome = takeTurn(guardState, labState);
		labState = turnOutcome.lab;
		guardState = turnOutcome.guard;
		onState = turnOutcome.on;
	}

	return new Set(guardState.visited.map((p) => `${p.x},${p.y}`)).size;
}

function part2(_input: string) {
	return "not implemented";
}

export default { p1: part1, p2: part2 };
