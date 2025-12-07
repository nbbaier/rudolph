import path from "node:path";
import { getSession } from "../env";
import { InvalidSessionError, MissingSessionError } from "../errors";
import { getDayPath } from ".";
import { type GuessEntry, recordGuess, type SubmissionStatus } from "./guesses";

export interface SubmissionResult {
	status: SubmissionStatus;
	message: string;
	raw: string;
}

function parseStatus(text: string): SubmissionResult {
	const lower = text.toLowerCase();
	if (lower.includes("right answer")) {
		return { status: "correct", message: "Correct answer", raw: text };
	}
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
}

export async function submitAnswer(
	year: string,
	day: string,
	part: "1" | "2",
	answer: string,
): Promise<SubmissionResult> {
	const session = getSession();
	if (!session) {
		throw new MissingSessionError();
	}
	const url = `https://adventofcode.com/${year}/day/${Number(day)}/answer`;
	const body = new URLSearchParams({ level: part, answer });
	const res = await fetch(url, {
		method: "POST",
		headers: {
			Cookie: `session=${session}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body,
	});
	const text = await res.text();
	const result = parseStatus(text);
	if (!res.ok && result.status === "error") {
		throw new InvalidSessionError();
	}
	return result;
}

export async function recordSubmission(
	entry: Omit<GuessEntry, "timestamp">,
	outputDir?: string,
): Promise<GuessEntry> {
	const timestamp = new Date().toISOString();
	const full: GuessEntry = { ...entry, timestamp };
	await recordGuess(full, outputDir);
	return full;
}

export function getProgressPath(
	year: string,
	day: string,
	outputDir?: string,
): string {
	return path.join(getDayPath(year, day, outputDir), "progress.json");
}
