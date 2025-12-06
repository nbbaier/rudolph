import type { Point } from "@/types";

export class Grid {
	data: string;
	points: Map<string, string>;
	rows: number;
	cols: number;

	constructor(input: string) {
		this.data = input;
		this.points = this.createGrid(input);
		this.rows = this.getRows(input);
		this.cols = this.getCols(input);
	}

	clone(): Grid {
		const cloned = new Grid(this.data);
		cloned.points = new Map(this.points);
		return cloned;
	}

	private createGrid(
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

	private getRows(input: string) {
		return input
			.trim()
			.split("\n")
			.map((line) => line.split("")).length;
	}

	private getCols(input: string) {
		return input
			.trim()
			.split("\n")
			.map((line) => line.split(""))[0].length;
	}

	private stringToPoint(key: string): Point {
		return { x: Number(key.split(",")[0]), y: Number(key.split(",")[1]) };
	}

	private pointToString(point: Point): string {
		return `${point.x},${point.y}`;
	}

	getPointValue(point: string): string | undefined {
		return this.points.get(point);
	}

	updatePointValue(point: string, value: string): void {
		if (this.points.get(point)) {
			this.points.set(point, value);
		}
	}

	checkOutOfBounds(point: string, rows: number, cols: number): boolean {
		const { x, y } = this.stringToPoint(point);
		return x < 0 || x >= cols || y < 0 || y >= rows;
	}

	getNeighbors(point: string, diagonal: boolean = false): string[] {
		const current = this.stringToPoint(point);
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

		return directions
			.map(([dx, dy]) => ({
				x: current.x + dx,
				y: current.y + dy,
			}))
			.map((p) => this.pointToString(p));
	}
}
