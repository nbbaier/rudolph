import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type { Task } from "../../src/utils/init/context";
import { scaffoldProject } from "../../src/utils/init/scaffold";
import { runTasks } from "../../src/utils/init/tasks";

describe("init integration tests", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-int-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	describe("scaffoldProject integration", () => {
		test("creates complete project structure", async () => {
			await scaffoldProject({
				projectName: "aoc-2024",
				cwd: tempDir,
				packageManager: "npm",
				aocSession: "test-session",
				aocYear: "2024",
				aocUserAgent: "test@example.com",
				solutionsDir: "solutions",
			});

			const files = fs.readdirSync(tempDir);
			expect(files).toContain("package.json");
			expect(files).toContain(".env");
			expect(files).toContain("README.md");
			expect(files).toContain(".gitignore");
			expect(files).toContain("solutions");
		});

		test("package.json has correct rudolph dependency", async () => {
			await scaffoldProject({
				projectName: "test-project",
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
			expect(pkg.dependencies["@nbbaier/rudolph"]).toBeDefined();
		});

		test("works with different package managers", async () => {
			for (const pm of ["npm", "bun", "yarn", "pnpm"]) {
				const pmDir = path.join(tempDir, pm);
				fs.mkdirSync(pmDir, { recursive: true });

				await scaffoldProject({
					projectName: `${pm}-project`,
					cwd: pmDir,
					packageManager: pm,
					aocSession: "",
					aocYear: "2024",
					aocUserAgent: "",
					solutionsDir: "solutions",
				});

				const readme = fs.readFileSync(path.join(pmDir, "README.md"), "utf-8");
				expect(readme).toContain(`${pm} install`);
			}
		});
	});

	describe("runTasks integration", () => {
		test("executes tasks in order", async () => {
			const results: string[] = [];
			const tasks: Task[] = [
				{
					start: "Task 1 starting",
					end: "Task 1 done",
					while: async () => {
						results.push("task1");
					},
				},
				{
					start: "Task 2 starting",
					end: "Task 2 done",
					while: async () => {
						results.push("task2");
					},
				},
			];

			await runTasks(tasks, { dryRun: false });

			expect(results).toEqual(["task1", "task2"]);
		});

		test("skips tasks in dry run mode", async () => {
			const results: string[] = [];
			const tasks: Task[] = [
				{
					while: async () => {
						results.push("task1");
					},
				},
			];

			await runTasks(tasks, { dryRun: true });

			expect(results).toEqual([]);
		});

		test("calls onError on task failure", async () => {
			let errorCaught = false;
			const tasks: Task[] = [
				{
					while: async () => {
						throw new Error("Task failed");
					},
					onError: () => {
						errorCaught = true;
					},
				},
			];

			await runTasks(tasks, { dryRun: false });

			expect(errorCaught).toBe(true);
		});
	});

	describe("project augmentation", () => {
		test("augments existing project with .gitignore", async () => {
			fs.writeFileSync(
				path.join(tempDir, "package.json"),
				JSON.stringify({ name: "existing" }),
			);
			fs.writeFileSync(path.join(tempDir, ".gitignore"), "custom-entry\n");

			await scaffoldProject({
				projectName: "existing",
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
			expect(gitignore).toContain("custom-entry");
			expect(gitignore).toContain("node_modules");
		});
	});
});
