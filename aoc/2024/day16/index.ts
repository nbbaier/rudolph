import { DefaultDictionary as DDict } from "typescript-collections";
import type { Cardinal, Point } from "@/types";
import { createGrid, getNeighbors, includesObject } from "@/utils";

const _isWall = (x: string) => x !== "#";

function part1(input: string): number | string {
	const grid = createGrid(input);
	const gridEntries = Array.from(grid.entries());
	const startEntry = gridEntries.find(([_k, v]) => v === "S");
	const endEntry = gridEntries.find(([_k, v]) => v === "E");
	if (!startEntry || !endEntry) {
		throw new Error("Start point or end point not found in the grid");
	}
	grid.delete(startEntry[0]);
	grid.delete(endEntry[0]);

	const start: Point = {
		x: startEntry[0].split(",").map(Number)[0],
		y: startEntry[0].split(",").map(Number)[1],
	};
	const target: Point = {
		x: endEntry[0].split(",").map(Number)[0],
		y: endEntry[0].split(",").map(Number)[1],
	};

	const _shortestPath = findShortestPath(start, target, grid, "r");

	return 0; // shortestPath ? shortestPath.score : 0;
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };

type State = [Point, Cardinal];

function distanceToTarget(start: Point, target: Point): number {
	return Math.abs(start.x - target.x) + Math.abs(start.y - target.y);
}

function smallestFScore(
	fScore: DDict<State, number>,
	openSet: Set<string>,
): State {
	const popped =
		Array.from(openSet)[Math.floor(Math.random() * Array.from(openSet).length)];
	openSet.delete(popped);

	const first = JSON.parse(popped);
	let smallest = fScore.getValue(first);
	let smallestPosition = first[0];
	let smallestDirection = first[1];

	for (const stateString of openSet) {
		const [position, direction] = JSON.parse(stateString);
		const score = fScore.getValue([position, direction]);
		if (score < smallest) {
			smallestPosition = position;
			smallestDirection = direction;
			smallest = score;
		}
	}

	return [smallestPosition, smallestDirection];
}

function getNextDirection(current: Point, neighor: Point) {
	const next = new Map<string, Cardinal>([
		["0,-1", "u"],
		["0,1", "d"],
		["1,0", "r"],
		["-1,0", "l"],
	]);
	return next.get(
		`${current.x - neighor.x},${current.y - neighor.y}`,
	) as Cardinal;
}

function findShortestPath(
	start: Point,
	target: Point,
	grid: Map<string, string>,
	direction: Cardinal,
): { path: State[]; score: number } | undefined {
	const openSet = new Set<string>();
	openSet.add(JSON.stringify([start, direction]));
	console.log(openSet);
	const cameFrom = new Map<string, string>();

	const gScore = new DDict<State, number>(
		() => Number.POSITIVE_INFINITY,
		JSON.stringify,
	);
	const fScore = new DDict<State, number>(
		() => Number.POSITIVE_INFINITY,
		JSON.stringify,
	);

	gScore.setValue([start, direction], 0);
	fScore.setValue([start, direction], distanceToTarget(start, target));
	while (openSet) {
		const [current, direction] = smallestFScore(fScore, openSet);
		if (JSON.stringify(current) === JSON.stringify(target)) {
			const score = gScore.getValue([current, direction]);

			return {
				path: [
					...reconstructPath(cameFrom, [current, direction]),
					[current, direction],
				],
				score,
			};
		}
		openSet.delete(JSON.stringify([current, direction]));
		const path = reconstructPath(cameFrom, [current, direction]);
		for (const neighbor of getValidNeighbors(current, grid, path)) {
			const nextDirection = getNextDirection(current, neighbor);
			let tentativeGScore = gScore.getValue([current, direction]) + 1;

			if (nextDirection !== direction) {
				tentativeGScore += 1000;
			}

			if (tentativeGScore < gScore.getValue([neighbor, nextDirection])) {
				cameFrom.set(
					JSON.stringify([neighbor, nextDirection]),
					JSON.stringify([current, direction]),
				);
				gScore.setValue([neighbor, nextDirection], tentativeGScore);
				fScore.setValue(
					[neighbor, nextDirection],
					tentativeGScore + distanceToTarget(neighbor, target),
				);
				openSet.add(JSON.stringify([neighbor, nextDirection]));
			}
		}
	}

	return undefined;
}

function reconstructPath(cameFrom: Map<string, string>, _item: State): State[] {
	const path: State[] = [];
	let item = _item;

	while (cameFrom.has(JSON.stringify(item))) {
		const nextItem = cameFrom.get(JSON.stringify(item));
		if (nextItem) {
			item = JSON.parse(nextItem);
		} else {
			break;
		}
		path.push(item);
	}

	return path.reverse();
}

function getValidNeighbors(
	current: Point,
	grid: Map<string, string>,
	path: State[],
): Point[] {
	const neighbors = getNeighbors(current);
	const _path = path.map(([coord, _]) => coord);

	return neighbors.filter((neighbor) => {
		// const { x, y } = neighbor;
		return (
			grid.get(JSON.stringify(neighbor)) && includesObject(_path, neighbor)
		);
	});
}
