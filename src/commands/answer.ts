import { recordSubmission, submitAnswer } from "../utils/answer";
import { buildDayPaths, executeRunner } from "../utils/cli-helpers";
import type { GuessEntry } from "../utils/guesses";
import { loadGuesses } from "../utils/guesses";
import { refreshCommand } from "./refresh";

function normalizeAnswer(value: unknown): string {
	if (value === undefined || value === null) {
		return "";
	}
	return String(value).trim();
}

function findDuplicate(
	guesses: GuessEntry[],
	part: "1" | "2",
	answer: string,
): GuessEntry | undefined {
	return guesses
		.slice()
		.reverse()
		.find((g) => g.part === part && g.answer === answer);
}

function getBounds(guesses: GuessEntry[], part: "1" | "2") {
	const lows = guesses.filter((g) => g.part === part && g.status === "too_low");
	const highs = guesses.filter(
		(g) => g.part === part && g.status === "too_high",
	);
	const maxLow = Math.max(
		...lows.map((g) => Number(g.answer)).filter((n) => Number.isFinite(n)),
		-Infinity,
	);
	const minHigh = Math.min(
		...highs.map((g) => Number(g.answer)).filter((n) => Number.isFinite(n)),
		Infinity,
	);
	return { maxLow, minHigh };
}

async function handlePart(
	year: string,
	day: string,
	part: "1" | "2",
	answer: string,
	guesses: GuessEntry[],
	outputDir?: string,
	refreshAfter?: boolean,
): Promise<GuessEntry> {
	if (!answer) {
		throw new Error(`No answer produced for part ${part}`);
	}
	const duplicate = findDuplicate(guesses, part, answer);
	if (duplicate && duplicate.status !== "wait") {
		console.log(
			`Skipping duplicate answer for part ${part}: ${answer} (${duplicate.status})`,
		);
		return duplicate;
	}
	const { maxLow, minHigh } = getBounds(guesses, part);
	const numericAnswer = Number(answer);
	if (Number.isFinite(numericAnswer)) {
		if (maxLow !== -Infinity && numericAnswer <= maxLow) {
			console.log(`Warning: previous too_low at ${maxLow}`);
		}
		if (minHigh !== Infinity && numericAnswer >= minHigh) {
			console.log(`Warning: previous too_high at ${minHigh}`);
		}
	}
	const submission = await submitAnswer(year, day, part, answer);
	const entry = await recordSubmission(
		{
			year,
			day,
			part,
			answer,
			status: submission.status,
			message: submission.message,
		},
		outputDir,
	);
	console.log(`Part ${part}: ${submission.message}`);
	if (submission.status === "wait") {
		console.log("AoC asked to wait before retrying.");
	}
	if (submission.status === "correct" && part === "1" && refreshAfter) {
		await refreshCommand(year, day, false, outputDir);
	}
	return entry;
}

export async function answerCommand(
	year: string,
	day: string,
	part: "1" | "2" | "both" = "1",
	outputDir?: string,
	refreshAfter = true,
): Promise<void> {
	const paths = buildDayPaths(year, day, outputDir);
	const guesses = await loadGuesses(year, day, outputDir);
	const result = await executeRunner(paths.runner, paths.input, part);
	if (part === "1" || part === "both") {
		const answer1 = normalizeAnswer(result.p1);
		const entry = await handlePart(
			year,
			day,
			"1",
			answer1,
			guesses,
			outputDir,
			refreshAfter,
		);
		guesses.push(entry);
	}
	if (part === "2" || part === "both") {
		const answer2 = normalizeAnswer(result.p2);
		await handlePart(year, day, "2", answer2, guesses, outputDir, false);
	}
}
