import { variance } from "mathjs";
import type { Board, Point } from "@/types";
import { Robot } from "./robot";
import { sortQudrants } from "./sortQudrants";

function part1(input: string) {
	const board: Board = { rows: 103, cols: 101 };
	const robots: Robot[] = input
		.trim()
		.split("\n")
		.map((line) => {
			const [px, py, vx, vy] = line.match(/-?\d+/g)?.map(Number) ?? [];
			return new Robot({ x: px, y: py }, { dx: vx, dy: vy }, board);
		});

	const simulations = 100;
	const finalPositions: Point[] = [];

	for (const robot of robots) {
		robot.move(simulations);
		finalPositions.push(robot.position);
	}

	const quadrants = sortQudrants(board, finalPositions);

	return Array.from(quadrants.keys())
		.map((key) => quadrants?.get(key)?.length ?? 0)
		.reduce((a, c) => a * c, 1);
}

// shamelessly copied from https://www.reddit.com/r/adventofcode/comments/1hdvhvu/comment/m20q56r/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
function part2(input: string) {
	// return 0;
	let currentSeconds = 0;
	const board: Board = { rows: 103, cols: 101 };
	const robots: Robot[] = input
		.trim()
		.split("\n")
		.map((line) => {
			const [px, py, vx, vy] = line.match(/-?\d+/g)?.map(Number) ?? [];
			return new Robot({ x: px, y: py }, { dx: vx, dy: vy }, board);
		});
	const rowVarianceThres =
		(variance(robots.map((r) => r.position.y)) as unknown as number) * 0.5;
	const colVarianceThres =
		(variance(robots.map((r) => r.position.x)) as unknown as number) * 0.5;
	let rowLowVariance = 0;
	let colLowVariance = 0;
	while (rowLowVariance === 0 || rowLowVariance === 0) {
		currentSeconds += 1;
		for (const robot of robots) {
			robot.move();
		}
		const currentRowVariance: number = variance(
			robots.map((r) => r.position.y),
		) as unknown as number;
		const currentColVariance: number = variance(
			robots.map((r) => r.position.x),
		) as unknown as number;
		if (rowLowVariance === 0 && currentRowVariance < rowVarianceThres) {
			rowLowVariance = currentSeconds % board.rows;
		}
		if (colLowVariance === 0 && currentColVariance < colVarianceThres) {
			colLowVariance = currentSeconds % board.cols;
		}
	}
	let x = 1;
	let y = 1;
	while (true) {
		const leftSide = rowLowVariance + board.rows * x;
		const rightSide = colLowVariance + board.cols * y;
		if (leftSide === rightSide) {
			return leftSide;
		}
		if (leftSide < rightSide) {
			x += 1;
		} else {
			y += 1;
		}
	}
}

export default { p1: part1, p2: part2 };
