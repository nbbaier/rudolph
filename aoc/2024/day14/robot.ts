import type { Board, Point, Velocity } from "@/types";

export class Robot {
	position: Point;
	velocity: Velocity;
	board: Board;
	simsRun: number;
	initialPosition: Point;

	constructor(position: Point, velocity: Velocity, board: Board) {
		this.initialPosition = position;
		this.position = position;
		this.velocity = velocity;
		this.board = board;
		this.simsRun = 0;
	}

	move(steps = 1) {
		const newX = this.position.x + this.velocity.dx * steps;
		const newY = this.position.y + this.velocity.dy * steps;

		const realX =
			((newX % this.board.cols) + this.board.cols) % this.board.cols;
		const realY =
			((newY % this.board.rows) + this.board.rows) % this.board.rows;

		this.position = {
			x: realX,
			y: realY,
		};

		this.simsRun += steps;
	}
}
