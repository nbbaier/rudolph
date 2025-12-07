import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { SubmissionResult } from "./answer";

const parseStatus = (text: string): SubmissionResult => {
	const lower = text.toLowerCase();
	if (lower.includes("did you already complete it")) {
		return {
			status: "already_completed",
			message: "Already completed",
			raw: text,
		};
	}
	if (lower.includes("not the right answer")) {
		if (lower.includes("too high")) {
			return { status: "too_high", message: "Too high", raw: text };
		}
		if (lower.includes("too low")) {
			return { status: "too_low", message: "Too low", raw: text };
		}
		return { status: "incorrect", message: "Incorrect", raw: text };
	}
	if (lower.includes("right answer")) {
		return { status: "correct", message: "Correct answer", raw: text };
	}
	if (
		lower.includes("you gave an answer too recently") ||
		lower.includes("please wait")
	) {
		return {
			status: "wait",
			message: "Rate limited, try again later",
			raw: text,
		};
	}
	if (
		lower.includes("not available yet") ||
		lower.includes("it's either too early")
	) {
		return { status: "locked", message: "Puzzle not unlocked", raw: text };
	}
	if (lower.includes("log in")) {
		return { status: "error", message: "Session may be invalid", raw: text };
	}
	return { status: "error", message: "Unknown response", raw: text };
};

describe("parseStatus", () => {
	test("detects correct answer", () => {
		const result = parseStatus("That's the right answer!");
		expect(result.status).toBe("correct");
		expect(result.message).toBe("Correct answer");
	});

	test("detects already completed", () => {
		const result = parseStatus("Did you already complete it?");
		expect(result.status).toBe("already_completed");
		expect(result.message).toBe("Already completed");
	});

	test("detects incorrect answer", () => {
		const result = parseStatus("That's not the right answer.");
		expect(result.status).toBe("incorrect");
		expect(result.message).toBe("Incorrect");
	});

	test("detects too high", () => {
		const result = parseStatus(
			"That's not the right answer; your answer is too high.",
		);
		expect(result.status).toBe("too_high");
		expect(result.message).toBe("Too high");
	});

	test("detects too low", () => {
		const result = parseStatus(
			"That's not the right answer; your answer is too low.",
		);
		expect(result.status).toBe("too_low");
		expect(result.message).toBe("Too low");
	});

	test("detects rate limit from 'answer too recently'", () => {
		const result = parseStatus("You gave an answer too recently.");
		expect(result.status).toBe("wait");
		expect(result.message).toBe("Rate limited, try again later");
	});

	test("detects rate limit from 'please wait'", () => {
		const result = parseStatus("Please wait before submitting again.");
		expect(result.status).toBe("wait");
	});

	test("detects locked puzzle from 'not available yet'", () => {
		const result = parseStatus("This puzzle is not available yet.");
		expect(result.status).toBe("locked");
		expect(result.message).toBe("Puzzle not unlocked");
	});

	test("detects locked puzzle from 'too early'", () => {
		const result = parseStatus(
			"It's either too early or you need to complete something first.",
		);
		expect(result.status).toBe("locked");
	});

	test("detects invalid session from 'log in'", () => {
		const result = parseStatus("Please log in to continue.");
		expect(result.status).toBe("error");
		expect(result.message).toBe("Session may be invalid");
	});

	test("returns error for unknown response", () => {
		const result = parseStatus("Some random text we don't recognize.");
		expect(result.status).toBe("error");
		expect(result.message).toBe("Unknown response");
	});

	test("preserves raw response text", () => {
		const rawText = "That's the right answer! You are amazing!";
		const result = parseStatus(rawText);
		expect(result.raw).toBe(rawText);
	});

	test("is case insensitive", () => {
		expect(parseStatus("THAT'S THE RIGHT ANSWER!").status).toBe("correct");
		expect(parseStatus("NOT THE RIGHT ANSWER").status).toBe("incorrect");
	});
});

describe("recordSubmission", () => {
	let tempDir: string;
	let originalHome: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-answer-"));
		originalHome = os.homedir();

		const cacheDir = path.join(tempDir, ".cache", "rudolph");
		fs.mkdirSync(cacheDir, { recursive: true });

		process.env.HOME = tempDir;
		process.env.USERPROFILE = tempDir;
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
		process.env.HOME = originalHome;
		process.env.USERPROFILE = originalHome;
	});

	test("adds timestamp to entry", async () => {
		const { recordSubmission } = await import("./answer");
		const outputDir = path.join(tempDir, "solutions");

		const entry = await recordSubmission(
			{
				year: "2024",
				day: "01",
				part: "1",
				answer: "42",
				status: "correct",
				message: "Correct!",
			},
			outputDir,
		);

		expect(entry.timestamp).toBeDefined();
		expect(new Date(entry.timestamp).getTime()).not.toBeNaN();
	});
});
