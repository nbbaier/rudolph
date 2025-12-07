import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRunnerFile, getDayPath, loadFile } from "./index";

describe("loadFile", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-utils-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("reads file content as string", () => {
		const filePath = path.join(tempDir, "test.txt");
		fs.writeFileSync(filePath, "hello world");

		const content = loadFile(filePath);
		expect(content).toBe("hello world");
	});

	test("reads multi-line files", () => {
		const filePath = path.join(tempDir, "multi.txt");
		fs.writeFileSync(filePath, "line1\nline2\nline3");

		const content = loadFile(filePath);
		expect(content).toBe("line1\nline2\nline3");
	});

	test("handles empty files", () => {
		const filePath = path.join(tempDir, "empty.txt");
		fs.writeFileSync(filePath, "");

		const content = loadFile(filePath);
		expect(content).toBe("");
	});

	test("throws on non-existent file", () => {
		expect(() => loadFile(path.join(tempDir, "nope.txt"))).toThrow();
	});
});

describe("getDayPath", () => {
	const originalEnv = process.env.OUTPUT_DIR;

	afterEach(() => {
		if (originalEnv !== undefined) {
			process.env.OUTPUT_DIR = originalEnv;
		} else {
			delete process.env.OUTPUT_DIR;
		}
	});

	test("constructs path with year and padded day", () => {
		const result = getDayPath("2024", "5", "./solutions");
		expect(result).toBe("solutions/2024/day05");
	});

	test("uses provided output dir", () => {
		const result = getDayPath("2024", "01", "/custom/path");
		expect(result).toBe("/custom/path/2024/day01");
	});

	test("uses OUTPUT_DIR env when no outputDir provided", () => {
		process.env.OUTPUT_DIR = "./my-output";
		const result = getDayPath("2024", "01");
		expect(result).toContain("my-output/2024/day01");
	});

	test("uses default ./aoc when OUTPUT_DIR not set", () => {
		delete process.env.OUTPUT_DIR;
		const result = getDayPath("2024", "01");
		expect(result).toContain("aoc/2024/day01");
	});

	test("handles double digit days without extra padding", () => {
		const result = getDayPath("2024", "25", "./out");
		expect(result).toBe("out/2024/day25");
	});
});

describe("createRunnerFile", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-runner-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("creates runner file with template content", async () => {
		const runnerPath = path.join(tempDir, "index.ts");

		await createRunnerFile(runnerPath);

		expect(fs.existsSync(runnerPath)).toBe(true);
		const content = fs.readFileSync(runnerPath, "utf-8");
		expect(content).toContain("function part1");
		expect(content).toContain("function part2");
		expect(content).toContain("export default");
		expect(content).toContain("p1: part1");
		expect(content).toContain("p2: part2");
	});

	test("requires parent directories to exist", async () => {
		const runnerPath = path.join(tempDir, "nested", "dir", "index.ts");

		await expect(createRunnerFile(runnerPath)).rejects.toThrow();
	});
});
