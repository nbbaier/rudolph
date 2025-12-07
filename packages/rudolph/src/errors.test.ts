import { describe, expect, test } from "bun:test";
import {
	DownloadError,
	InputNotFoundError,
	InvalidRunnerError,
	InvalidSessionError,
	MissingSessionError,
	RudolphError,
	RunnerImportError,
	RunnerNotFoundError,
} from "./errors";

describe("RudolphError", () => {
	test("extends Error", () => {
		const error = new RudolphError("test message");
		expect(error).toBeInstanceOf(Error);
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("sets correct name", () => {
		const error = new RudolphError("test");
		expect(error.name).toBe("RudolphError");
	});

	test("sets correct message", () => {
		const error = new RudolphError("custom message");
		expect(error.message).toBe("custom message");
	});
});

describe("MissingSessionError", () => {
	test("extends RudolphError", () => {
		const error = new MissingSessionError();
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new MissingSessionError();
		expect(error.name).toBe("MissingSessionError");
	});

	test("has helpful message", () => {
		const error = new MissingSessionError();
		expect(error.message).toContain("AOC_SESSION");
		expect(error.message).toContain(".env");
	});
});

describe("DownloadError", () => {
	test("extends RudolphError", () => {
		const error = new DownloadError("failed");
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new DownloadError("failed");
		expect(error.name).toBe("DownloadError");
	});

	test("stores status code", () => {
		const error = new DownloadError("not found", 404);
		expect(error.statusCode).toBe(404);
	});

	test("status code is optional", () => {
		const error = new DownloadError("generic error");
		expect(error.statusCode).toBeUndefined();
	});
});

describe("InvalidSessionError", () => {
	test("extends RudolphError", () => {
		const error = new InvalidSessionError();
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new InvalidSessionError();
		expect(error.name).toBe("InvalidSessionError");
	});

	test("mentions session and .env", () => {
		const error = new InvalidSessionError();
		expect(error.message).toContain("AOC_SESSION");
		expect(error.message).toContain(".env");
	});
});

describe("RunnerNotFoundError", () => {
	test("extends RudolphError", () => {
		const error = new RunnerNotFoundError("/path/to/runner");
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new RunnerNotFoundError("/path/to/runner");
		expect(error.name).toBe("RunnerNotFoundError");
	});

	test("includes path and setup hint", () => {
		const error = new RunnerNotFoundError("/my/runner.ts");
		expect(error.message).toContain("/my/runner.ts");
		expect(error.message).toContain("rudolph setup");
	});
});

describe("InvalidRunnerError", () => {
	test("extends RudolphError", () => {
		const error = new InvalidRunnerError("/path/to/runner");
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new InvalidRunnerError("/path/to/runner");
		expect(error.name).toBe("InvalidRunnerError");
	});

	test("includes path and expected export format", () => {
		const error = new InvalidRunnerError("/my/runner.ts");
		expect(error.message).toContain("/my/runner.ts");
		expect(error.message).toContain("p1");
		expect(error.message).toContain("p2");
	});
});

describe("InputNotFoundError", () => {
	test("extends RudolphError", () => {
		const error = new InputNotFoundError("/path/to/input");
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new InputNotFoundError("/path/to/input");
		expect(error.name).toBe("InputNotFoundError");
	});

	test("includes path and setup hint", () => {
		const error = new InputNotFoundError("/my/input.txt");
		expect(error.message).toContain("/my/input.txt");
		expect(error.message).toContain("rudolph setup");
	});
});

describe("RunnerImportError", () => {
	test("extends RudolphError", () => {
		const error = new RunnerImportError("/path/to/runner");
		expect(error).toBeInstanceOf(RudolphError);
	});

	test("has correct name", () => {
		const error = new RunnerImportError("/path/to/runner");
		expect(error.name).toBe("RunnerImportError");
	});

	test("includes path", () => {
		const error = new RunnerImportError("/my/runner.ts");
		expect(error.message).toContain("/my/runner.ts");
	});

	test("includes cause error message when provided", () => {
		const cause = new Error("syntax error");
		const error = new RunnerImportError("/my/runner.ts", cause);
		expect(error.message).toContain("syntax error");
	});

	test("works without cause", () => {
		const error = new RunnerImportError("/my/runner.ts");
		expect(error.message).toContain("Failed to import");
	});
});
