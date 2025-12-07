import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scaffoldProject } from "./scaffold";

describe("scaffoldProject", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-test-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("creates project files directly in cwd (no double nesting)", async () => {
		const projectDir = path.join(tempDir, "my-aoc-project");

		await scaffoldProject({
			projectName: "my-aoc-project",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "test-session",
			aocYear: "2024",
			aocUserAgent: "test@example.com",
			solutionsDir: "solutions",
		});

		expect(fs.existsSync(path.join(projectDir, "package.json"))).toBe(true);
		expect(fs.existsSync(path.join(projectDir, ".env"))).toBe(true);
		expect(fs.existsSync(path.join(projectDir, "README.md"))).toBe(true);
		expect(fs.existsSync(path.join(projectDir, ".gitignore"))).toBe(true);
		expect(fs.existsSync(path.join(projectDir, "solutions"))).toBe(true);

		const nestedPath = path.join(projectDir, "my-aoc-project");
		expect(fs.existsSync(nestedPath)).toBe(false);
	});

	test("creates solutions directory", async () => {
		const projectDir = path.join(tempDir, "test-project");

		await scaffoldProject({
			projectName: "test-project",
			cwd: projectDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "src/days",
		});

		expect(fs.existsSync(path.join(projectDir, "src/days"))).toBe(true);
	});

	test("generates correct package.json", async () => {
		const projectDir = path.join(tempDir, "pkg-test");

		await scaffoldProject({
			projectName: "pkg-test",
			cwd: projectDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const pkgJson = JSON.parse(
			fs.readFileSync(path.join(projectDir, "package.json"), "utf-8"),
		);

		expect(pkgJson.name).toBe("pkg-test");
		expect(pkgJson.private).toBe(true);
		expect(pkgJson.type).toBe("module");
		expect(pkgJson.scripts.setup).toBe("rudolph setup");
		expect(pkgJson.dependencies.rudolph).toMatch(/^\^/);
	});

	test("generates .env with correct values", async () => {
		const projectDir = path.join(tempDir, "env-test");

		await scaffoldProject({
			projectName: "env-test",
			cwd: projectDir,
			packageManager: "npm",
			aocSession: "abc123",
			aocYear: "2023",
			aocUserAgent: "user@example.com",
			solutionsDir: "solutions",
		});

		const envContent = fs.readFileSync(path.join(projectDir, ".env"), "utf-8");

		expect(envContent).toContain("AOC_SESSION=abc123");
		expect(envContent).toContain("AOC_YEAR=2023");
		expect(envContent).toContain("AOC_USER_AGENT=user@example.com");
		expect(envContent).toContain("OUTPUT_DIR=./solutions");
	});

	test("generates README with project name and year", async () => {
		const projectDir = path.join(tempDir, "readme-test");

		await scaffoldProject({
			projectName: "my-advent",
			cwd: projectDir,
			packageManager: "pnpm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const readme = fs.readFileSync(path.join(projectDir, "README.md"), "utf-8");

		expect(readme).toContain("# my-advent");
		expect(readme).toContain("Advent of Code 2024");
		expect(readme).toContain("pnpm install");
		expect(readme).toContain("pnpm run setup");
	});

	test("creates .gitignore with standard entries", async () => {
		const projectDir = path.join(tempDir, "gitignore-test");

		await scaffoldProject({
			projectName: "gitignore-test",
			cwd: projectDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const gitignore = fs.readFileSync(
			path.join(projectDir, ".gitignore"),
			"utf-8",
		);

		expect(gitignore).toContain("node_modules");
		expect(gitignore).toContain("dist");
	});
});
