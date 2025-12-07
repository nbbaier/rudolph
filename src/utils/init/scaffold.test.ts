import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scaffoldProject } from "./scaffold";

describe("scaffoldProject", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-scaffold-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("creates project files in cwd", async () => {
		await scaffoldProject({
			projectName: "test-project",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "test-session",
			aocYear: "2024",
			aocUserAgent: "test@example.com",
			solutionsDir: "solutions",
		});

		expect(fs.existsSync(path.join(tempDir, "package.json"))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, ".env"))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, "README.md"))).toBe(true);
		expect(fs.existsSync(path.join(tempDir, ".gitignore"))).toBe(true);
	});

	test("creates solutions directory", async () => {
		await scaffoldProject({
			projectName: "test-project",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "my-solutions",
		});

		expect(fs.existsSync(path.join(tempDir, "my-solutions"))).toBe(true);
	});

	test("generates correct package.json", async () => {
		await scaffoldProject({
			projectName: "advent-test",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const pkg = JSON.parse(
			fs.readFileSync(path.join(tempDir, "package.json"), "utf-8"),
		);
		expect(pkg.name).toBe("advent-test");
		expect(pkg.private).toBe(true);
		expect(pkg.type).toBe("module");
		expect(pkg.scripts.setup).toBe("rudolph setup");
		expect(pkg.scripts["run:input"]).toBe("rudolph run input");
		expect(pkg.scripts["run:sample"]).toBe("rudolph run sample");
		expect(pkg.devDependencies.typescript).toBeDefined();
		expect(pkg.devDependencies["@types/node"]).toBeDefined();
		expect(pkg.devDependencies["@types/bun"]).toBeUndefined();
		expect(pkg.packageManager).toContain("npm@");
	});

	test("generates .env with correct values", async () => {
		await scaffoldProject({
			projectName: "test-project",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "my-session-cookie",
			aocYear: "2023",
			aocUserAgent: "user@test.com",
			solutionsDir: "solutions",
		});

		const envContent = fs.readFileSync(path.join(tempDir, ".env"), "utf-8");
		expect(envContent).toContain("AOC_SESSION=my-session-cookie");
		expect(envContent).toContain("AOC_YEAR=2023");
		expect(envContent).toContain("AOC_USER_AGENT=user@test.com");
		expect(envContent).toContain("OUTPUT_DIR=./solutions");
	});

	test("generates README with project name and year", async () => {
		await scaffoldProject({
			projectName: "aoc-2024",
			cwd: tempDir,
			packageManager: "bun",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const readme = fs.readFileSync(path.join(tempDir, "README.md"), "utf-8");
		expect(readme).toContain("# aoc-2024");
		expect(readme).toContain("Advent of Code 2024");
		expect(readme).toContain("bun install");
		expect(readme).toContain("bun run setup");
		const pkg = JSON.parse(
			fs.readFileSync(path.join(tempDir, "package.json"), "utf-8"),
		);
		expect(pkg.devDependencies["@types/bun"]).toBeDefined();
		expect(pkg.packageManager).toContain("bun@");
	});

	test("creates .gitignore with standard entries", async () => {
		await scaffoldProject({
			projectName: "test-project",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const gitignore = fs.readFileSync(
			path.join(tempDir, ".gitignore"),
			"utf-8",
		);
		expect(gitignore).toContain("node_modules");
		expect(gitignore).toContain("dist");
	});

	test("appends to existing .gitignore", async () => {
		fs.writeFileSync(path.join(tempDir, ".gitignore"), "existing-entry\n");

		await scaffoldProject({
			projectName: "test-project",
			cwd: tempDir,
			packageManager: "npm",
			aocSession: "",
			aocYear: "2024",
			aocUserAgent: "",
			solutionsDir: "solutions",
		});

		const gitignore = fs.readFileSync(
			path.join(tempDir, ".gitignore"),
			"utf-8",
		);
		expect(gitignore).toContain("existing-entry");
		expect(gitignore).toContain("node_modules");
	});
});
