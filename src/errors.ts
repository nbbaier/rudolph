export class RudolphError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RudolphError";
	}
}

export class MissingSessionError extends RudolphError {
	constructor() {
		super("AOC_SESSION not found. Add it to your .env file.");
		this.name = "MissingSessionError";
	}
}

export class DownloadError extends RudolphError {
	constructor(
		message: string,
		public readonly statusCode?: number,
	) {
		super(message);
		this.name = "DownloadError";
	}
}

export class InvalidSessionError extends RudolphError {
	constructor() {
		super(
			"Your AOC_SESSION may be invalid or expired. Please update it in your .env file.",
		);
		this.name = "InvalidSessionError";
	}
}

export class RunnerNotFoundError extends RudolphError {
	constructor(path: string) {
		super(`Runner not found at ${path}. Have you run "rudolph setup"?`);
		this.name = "RunnerNotFoundError";
	}
}

export class InvalidRunnerError extends RudolphError {
	constructor(path: string) {
		super(
			`Runner at ${path} must default-export { p1: (input) => ..., p2: (input) => ... }.`,
		);
		this.name = "InvalidRunnerError";
	}
}

export class InputNotFoundError extends RudolphError {
	constructor(path: string) {
		super(
			`Input file not found at ${path}. Have you run "rudolph setup" or filled in the sample?`,
		);
		this.name = "InputNotFoundError";
	}
}

export class RunnerImportError extends RudolphError {
	constructor(path: string, cause?: Error) {
		super(
			`Failed to import runner at ${path}. Ensure it compiles correctly.${cause ? ` Error: ${cause.message}` : ""}`,
		);
		this.name = "RunnerImportError";
	}
}
