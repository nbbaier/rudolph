import { arrowDirections as directions } from "@/constants";

type Board = Map<string, string>;

function _drawBoard(board: Board): string {
	const result = Array(8)
		.fill("")
		.map(() => Array(8).fill(""));

	for (const [coords, value] of Array.from(board.entries())) {
		const [x, y] = coords.split(",").map(Number);
		result[y][x] = value;
	}
	return result.map((line) => line.join("")).join("\n");
}

function getGPS(board: Board) {
	return Array.from(board.entries())
		.filter((cell) => cell[1] === "O")
		.map(([coords, _]) => {
			return coords.split(",").map(Number);
		})
		.map(([x, y]) => x + y * 100);
}

function moveRobot(
	robot: number[],
	board: Board,
	dir: string,
): { robot: number[]; board: Board } {
	const [dx, dy] = directions.get(dir) as number[];
	const [newX, newY] = [robot[0] + dx, robot[1] + dy];
	const oldKey = `${robot[0]},${robot[1]}`;
	const newKey = `${newX},${newY}`;

	function canMoveChain(
		x: number,
		y: number,
		visited = new Set<string>(),
	): boolean {
		const key = `${x},${y}`;
		if (visited.has(key)) return false;
		visited.add(key);

		const space = board.get(key);

		if (space === "." || space === undefined) return true;

		if (space === "#") return false;

		if (space === "O") {
			return canMoveChain(x + dx, y + dy, visited);
		}
		return true;
	}

	if (!canMoveChain(newX, newY)) {
		return { robot, board };
	}

	function moveChain(x: number, y: number, visited = new Set<string>()): void {
		const key = `${x},${y}`;
		if (visited.has(key)) return;
		visited.add(key);

		const space = board.get(key);
		if (space === "O") {
			moveChain(x + dx, y + dy, visited);

			board.set(`${x + dx},${y + dy}`, "O");
			board.set(key, ".");
		}
	}

	if (board.get(newKey) === "O") {
		moveChain(newX, newY);
	}

	board.set(newKey, "@");
	board.set(oldKey, ".");

	return { robot: [newX, newY], board };
}

function part1(input: string): number | string {
	const grid = input
		.trim()
		.split("\n\n")[0]
		.split("\n")
		.map((line) => line.split(""));
	const sequence = input.trim().split("\n\n")[1].replaceAll("\n", "").split("");

	const rows = grid.length;
	const cols = grid[0].length;
	let board = new Map<string, string>();

	let robot = [0, 0];

	for (let x = 0; x < cols; x++) {
		for (let y = 0; y < rows; y++) {
			const type = grid[y][x];
			if (type === "@") {
				robot = [robot[0] + x, robot[1] + y];
			}
			const cellKey = `${x},${y}`;
			if (!board.get(cellKey)) {
				board.set(cellKey, type);
			}
		}
	}

	for (const instruction of sequence) {
		const { robot: r, board: b } = moveRobot(robot, board, instruction);
		robot = r;
		board = b;
	}

	return getGPS(board).reduce((a, c) => a + c, 0);
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };
