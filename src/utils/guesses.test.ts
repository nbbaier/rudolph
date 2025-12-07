import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { GuessEntry } from "./guesses";
import { loadGuesses, recordGuess } from "./guesses";

describe("guesses", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-guesses-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	const createEntry = (overrides: Partial<GuessEntry> = {}): GuessEntry => ({
		timestamp: new Date().toISOString(),
		year: "2024",
		day: "01",
		part: "1",
		answer: "42",
		status: "correct",
		message: "Correct!",
		...overrides,
	});

	describe("loadGuesses", () => {
		test("returns guesses from cache and project paths", async () => {
			const outputDir = path.join(tempDir, "solutions");
			fs.mkdirSync(outputDir, { recursive: true });

			const guesses = await loadGuesses("9999", "99", outputDir);
			expect(guesses).toEqual([]);
		});

		test("loads guesses from project path", async () => {
			const outputDir = path.join(tempDir, "solutions");
			const dayDir = path.join(outputDir, "2024", "day01");
			fs.mkdirSync(dayDir, { recursive: true });

			const entry = createEntry();
			fs.writeFileSync(
				path.join(dayDir, "guesses.ndjson"),
				`${JSON.stringify(entry)}\n`,
			);

			const guesses = await loadGuesses("2024", "01", outputDir);
			expect(guesses.length).toBeGreaterThanOrEqual(1);
			expect(guesses.some((g) => g.answer === "42")).toBe(true);
		});

		test("deduplicates entries with same key", async () => {
			const outputDir = path.join(tempDir, "solutions");
			const dayDir = path.join(outputDir, "2024", "day01");
			fs.mkdirSync(dayDir, { recursive: true });

			const entry = createEntry({ timestamp: "2024-01-01T00:00:00Z" });
			const content = `${JSON.stringify(entry)}\n${JSON.stringify(entry)}\n`;
			fs.writeFileSync(path.join(dayDir, "guesses.ndjson"), content);

			const guesses = await loadGuesses("2024", "01", outputDir);
			const matching = guesses.filter(
				(g) => g.timestamp === "2024-01-01T00:00:00Z" && g.answer === "42",
			);
			expect(matching.length).toBe(1);
		});

		test("sorts entries by timestamp", async () => {
			const outputDir = path.join(tempDir, "solutions");
			const dayDir = path.join(outputDir, "2024", "day01");
			fs.mkdirSync(dayDir, { recursive: true });

			const entry1 = createEntry({
				timestamp: "2024-01-01T12:00:00Z",
				answer: "first",
			});
			const entry2 = createEntry({
				timestamp: "2024-01-01T10:00:00Z",
				answer: "second",
			});

			const content = `${JSON.stringify(entry1)}\n${JSON.stringify(entry2)}\n`;
			fs.writeFileSync(path.join(dayDir, "guesses.ndjson"), content);

			const guesses = await loadGuesses("2024", "01", outputDir);
			const projectGuesses = guesses.filter(
				(g) => g.answer === "first" || g.answer === "second",
			);
			expect(projectGuesses[0].answer).toBe("second");
			expect(projectGuesses[1].answer).toBe("first");
		});

		test("handles malformed JSON lines gracefully", async () => {
			const outputDir = path.join(tempDir, "solutions");
			const dayDir = path.join(outputDir, "2024", "day01");
			fs.mkdirSync(dayDir, { recursive: true });

			const entry = createEntry({ answer: "valid-answer" });
			const content = `invalid json\n${JSON.stringify(entry)}\n{broken\n`;
			fs.writeFileSync(path.join(dayDir, "guesses.ndjson"), content);

			const guesses = await loadGuesses("2024", "01", outputDir);
			expect(guesses.some((g) => g.answer === "valid-answer")).toBe(true);
		});
	});

	describe("recordGuess", () => {
		test("appends entry to project file", async () => {
			const outputDir = path.join(tempDir, "solutions");
			const entry = createEntry({ answer: "unique-test-answer" });

			await recordGuess(entry, outputDir);

			const dayDir = path.join(outputDir, "2024", "day01");
			const content = fs.readFileSync(
				path.join(dayDir, "guesses.ndjson"),
				"utf-8",
			);
			expect(content).toContain('"answer":"unique-test-answer"');
		});

		test("creates directories if they don't exist", async () => {
			const outputDir = path.join(tempDir, "new-solutions");
			const entry = createEntry();

			await recordGuess(entry, outputDir);

			const dayDir = path.join(outputDir, "2024", "day01");
			expect(fs.existsSync(path.join(dayDir, "guesses.ndjson"))).toBe(true);
		});
	});
});
