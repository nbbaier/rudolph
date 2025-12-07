import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scaffoldProject } from "./scaffold";

const now = new Date();
const CURRENT_YEAR = String(now.getFullYear());
const CURRENT_DAY = String(now.getDate()).padStart(2, "0");

function expectBaseFiles(
	projectRoot: string,
	opts: { includeEnv: boolean; includeGitignore: boolean },
) {
	expect(fs.existsSync(path.join(projectRoot, "package.json"))).toBe(true);
	expect(fs.existsSync(path.join(projectRoot, "README.md"))).toBe(true);
	expect(fs.existsSync(path.join(projectRoot, ".env"))).toBe(opts.includeEnv);
	expect(fs.existsSync(path.join(projectRoot, ".gitignore"))).toBe(
		opts.includeGitignore,
	);
}

function expectSolutionTree(projectRoot: string, solutionsDir: string) {
	const solutionsRoot = path.join(projectRoot, solutionsDir);
	expect(fs.existsSync(solutionsRoot)).toBe(true);

	const yearDir = path.join(solutionsRoot, CURRENT_YEAR);
	expect(fs.existsSync(yearDir)).toBe(true);

	const dayDir = path.join(yearDir, `day${CURRENT_DAY}`);
	expect(fs.existsSync(dayDir)).toBe(true);

	for (const file of ["index.ts", "puzzle.md", "input.txt", "sample.txt"]) {
		expect(fs.existsSync(path.join(dayDir, file))).toBe(true);
	}
}

describe("scaffoldProject flow", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "create-rudolph-flow-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("default project name with default output directory", async () => {
		const projectDir = path.join(tempDir, "advent-of-code");

		await scaffoldProject({
			projectName: "advent-of-code",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		expectBaseFiles(projectDir, { includeEnv: true, includeGitignore: true });
		expectSolutionTree(projectDir, "solutions");
	});

	test("default project name with custom output directory", async () => {
		const projectDir = path.join(tempDir, "advent-of-code");

		await scaffoldProject({
			projectName: "advent-of-code",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "answers",
		});

		expectBaseFiles(projectDir, { includeEnv: true, includeGitignore: true });
		expectSolutionTree(projectDir, "answers");
	});

	test("custom project name with default output directory", async () => {
		const projectDir = path.join(tempDir, "my-aoc-workshop");

		await scaffoldProject({
			projectName: "my-aoc-workshop",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		expectBaseFiles(projectDir, { includeEnv: true, includeGitignore: true });
		expectSolutionTree(projectDir, "solutions");
	});

	test("custom project name with custom output directory", async () => {
		const projectDir = path.join(tempDir, "my-aoc-workshop");

		await scaffoldProject({
			projectName: "my-aoc-workshop",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "answers",
		});

		expectBaseFiles(projectDir, { includeEnv: true, includeGitignore: true });
		expectSolutionTree(projectDir, "answers");
	});

	test("project name is current directory with default output directory", async () => {
		const projectDir = tempDir;

		await scaffoldProject({
			projectName: path.basename(projectDir),
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		expectBaseFiles(projectDir, { includeEnv: false, includeGitignore: false });
		expectSolutionTree(projectDir, "solutions");
	});

	test("project name is current directory with custom output directory", async () => {
		const projectDir = tempDir;

		await scaffoldProject({
			projectName: path.basename(projectDir),
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: CURRENT_YEAR,
			aocUserAgent: "",
			solutionsDir: "answers",
		});

		expectBaseFiles(projectDir, { includeEnv: false, includeGitignore: false });
		expectSolutionTree(projectDir, "answers");
	});
});
