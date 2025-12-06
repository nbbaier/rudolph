/**
 * Represents the test data used for testing purposes.
 */
export interface TestData {
	name?: string;
	input: string;
	output: string | number;
}

/**
 * A map where the keys are strings and the values are of type `TestData`.
 */
export type TestMap = Map<string, TestData>;

/**
 * Represents a point in a 2D space.
 *
 * @property {number} x - The x-coordinate of the point.
 * @property {number} y - The y-coordinate of the point.
 */
export type Point = {
	x: number;
	y: number;
};

/**
 * Represents a velocity with horizontal and vertical components.
 *
 * @property {number} dx - The change in the x-direction (horizontal).
 * @property {number} dy - The change in the y-direction (vertical).
 */
export type Velocity = { dx: number; dy: number };

/**
 * Represents a game board with a specified number of rows and columns.
 */
export interface Board {
	rows: number;
	cols: number;
}

/**
 * Represents a direction with horizontal and vertical components.
 *
 * @property {number} dx - The change in the x-axis direction.
 * @property {number} dy - The change in the y-axis direction.
 */
export type Direction = {
	dx: number;
	dy: number;
};

/**
 * Represents a direction label.
 *
 * Possible values:
 * - `"r"`: Right
 * - `"l"`: Left
 * - `"d"`: Down
 * - `"u"`: Up
 * - `"ur"`: Up-Right
 * - `"dl"`: Down-Left
 * - `"dr"`: Down-Right
 * - `"ul"`: Up-Left
 */
type DirLabel = "r" | "l" | "d" | "u" | "ur" | "dl" | "dr" | "ul";

/**
 * Represents a set of directions, where each key is a label of type `DirLabel`
 * and the corresponding value is an optional `Direction`.
 *
 * @template K - The label of the direction, constrained to `DirLabel`.
 * @template Direction - The type representing a direction.
 */
export type DirectionSet = {
	[K in DirLabel]?: Direction;
};

/**
 * Represents the cardinal directions by omitting the diagonal directions
 * ("ur", "dl", "dr", "ul") from the DirLabel type.
 */
export type Cardinal = Omit<DirLabel, "ur" | "dl" | "dr" | "ul">;
