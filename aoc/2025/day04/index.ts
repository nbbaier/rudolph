import { Grid } from "@/utils/grid";

function getRemovableRolls(grid: Grid): string[] {
	const removableRolls: string[] = [];
	for (const point of grid.points.keys()) {
		if (grid.getPointValue(point) === ".") continue;
		const isAccessible =
			grid
				.getNeighbors(point, true)
				.map((p) => grid.getPointValue(p))
				.filter((p) => p !== ".")
				.filter(Boolean).length < 4;
		if (isAccessible) removableRolls.push(point);
	}
	return removableRolls;
}

function removeRolls(grid: Grid, removeableRolls: string[]): Grid {
	const outputGrid = grid.clone();
	for (const roll of removeableRolls) {
		outputGrid.updatePointValue(roll, ".");
	}
	return outputGrid;
}

function part1(input: string): number | string {
	const grid = new Grid(input);
	return getRemovableRolls(grid).length;
}

function part2(input: string): number | string {
	let grid = new Grid(input);
	let count = getRemovableRolls(grid).length;
	let totalRemoved = count;
	while (count > 0) {
		grid = removeRolls(grid, getRemovableRolls(grid));
		count = getRemovableRolls(grid).length;
		totalRemoved += count;
	}

	return totalRemoved;
}

export default { p1: part1, p2: part2 };
