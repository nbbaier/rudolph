import type { Point } from "@/types";

/**
 * Generates an array of arrays, each missing one element from the original array.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The input array.
 * @returns {T[][]} An array of arrays, each with one element removed from the original array.
 */
export function dropOne<T>(arr: T[]): T[][] {
	return arr.map((_, index) =>
		arr.filter((_, filterIndex) => filterIndex !== index),
	);
}

/**
 * Returns the middle index of an array. If the array is empty, returns null.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} arr - The array to find the middle index of.
 * @returns {number | null} The middle index of the array, or null if the array is empty.
 */
export function getMiddleIndex<T>(arr: T[]): number | null {
	if (arr.length === 0) {
		return null;
	}
	return Math.floor(arr.length / 2);
}

/**
 * Delays the execution of code for a specified number of milliseconds.
 *
 * @param ms - The number of milliseconds to delay.
 * @returns A promise that resolves after the specified delay.
 */
export const delay = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Checks if an array contains an object matching specific keys.
 *
 * @template T - The type of objects in the array.
 * @param arr - The array to search.
 * @param obj - The object to find.
 * @param keys - The keys to compare (defaults to all keys of obj).
 * @returns True if a matching object is found.
 */
export function includesObject<T extends object>(
	arr: T[],
	obj: T,
	keys: (keyof T)[] = Object.keys(obj) as (keyof T)[],
): boolean {
	return arr.some((item) => keys.every((key) => item[key] === obj[key]));
}

/**
 * Removes and returns a random element from a Set.
 *
 * @template T - The type of elements in the set.
 * @param set - The set to pop from.
 * @returns The removed element, or undefined if the set is empty.
 */
export function popFromSet<T>(set: Set<T>): T | undefined {
	if (set.size < 1) {
		return undefined;
	}
	const items = Array.from(set);
	const item = items[Math.floor(Math.random() * items.length)];
	set.delete(item);
	return item;
}

/**
 * Generates an array of numbers from start to end.
 *
 * @param {number} start - The starting number.
 * @param {number} end - The ending number.
 * @returns An array of numbers from start to end.
 */
export function range(start: number, end: number): number[] {
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Checks if a string is a repeated substring.
 *
 * @param {string} s - The string to check.
 * @returns {boolean}True if the string is a repeated substring.
 */
export function repeatedSubstring(s: string): boolean {
	return (s + s).slice(1, -1).includes(s);
}

/**
 * Checks if the given coordinates (x, y) are out of the bounds of a grid.
 *
 * @param x - The x-coordinate to check.
 * @param y - The y-coordinate to check.
 * @param rows - The number of rows in the grid.
 * @param cols - The number of columns in the grid.
 * @returns `true` if the coordinates are out of bounds, `false` otherwise.
 */
export function checkOutOfBounds(
	x: number,
	y: number,
	rows: number,
	cols: number,
): boolean {
	return x < 0 || x >= cols || y < 0 || y >= rows;
}

export function getNeighbors(
	current: Point,
	diagonal: boolean = false,
): Point[] {
	const directions = diagonal
		? [
				[-1, -1],
				[0, -1],
				[1, -1],
				[-1, 0],
				[1, 0],
				[-1, 1],
				[0, 1],
				[1, 1],
			]
		: [
				[0, -1],
				[0, 1],
				[1, 0],
				[-1, 0],
			];

	return directions.map(([dx, dy]) => ({
		x: current.x + dx,
		y: current.y + dy,
	}));
}

export function createGrid(
	input: string,
	fn: (cell: string) => boolean = (_cell) => true,
): Map<string, string> {
	const data: string[][] = input
		.trim()
		.split("\n")
		.map((line) => line.split(""));

	const grid = new Map<string, string>();

	for (let y = 0; y < data.length; y++) {
		for (let x = 0; x < data[0].length; x++) {
			const key = `${x},${y}`;
			const value = data[y][x];

			if (fn(value)) {
				grid.set(key, value);
			}
		}
	}

	return grid;
}
