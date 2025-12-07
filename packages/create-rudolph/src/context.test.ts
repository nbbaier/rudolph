import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { getContext } from "./context";

describe("getContext", () => {
	const originalCwd = process.cwd();
	const originalEnv = { ...process.env };

	afterEach(() => {
		process.chdir(originalCwd);
		process.env = { ...originalEnv };
	});

	test("cwd is set to process.cwd(), not the CLI argument", async () => {
		const ctx = await getContext(["my-project"]);

		expect(ctx.cwd).toBe(process.cwd());
		expect(ctx.projectName).toBe("my-project");
	});

	test("projectName is extracted from first positional argument", async () => {
		const ctx = await getContext(["advent-2024"]);

		expect(ctx.projectName).toBe("advent-2024");
	});

	test("--yes flag sets yes to true", async () => {
		const ctx = await getContext(["my-project", "--yes"]);

		expect(ctx.yes).toBe(true);
	});

	test("-y alias works for --yes", async () => {
		const ctx = await getContext(["my-project", "-y"]);

		expect(ctx.yes).toBe(true);
	});

	test("--no flag disables yes, install, and git", async () => {
		const ctx = await getContext(["my-project", "--no"]);

		expect(ctx.yes).toBe(false);
		expect(ctx.install).toBe(false);
		expect(ctx.git).toBe(false);
	});

	test("--dry-run flag is captured", async () => {
		const ctx = await getContext(["my-project", "--dry-run"]);

		expect(ctx.dryRun).toBe(true);
	});

	test("--install and --no-install flags work", async () => {
		const ctxInstall = await getContext(["proj", "--install"]);
		expect(ctxInstall.install).toBe(true);

		const ctxNoInstall = await getContext(["proj", "--no-install"]);
		expect(ctxNoInstall.install).toBe(false);
	});

	test("--git and --no-git flags work", async () => {
		const ctxGit = await getContext(["proj", "--git"]);
		expect(ctxGit.git).toBe(true);

		const ctxNoGit = await getContext(["proj", "--no-git"]);
		expect(ctxNoGit.git).toBe(false);
	});

	test("detects package manager from npm_config_user_agent", async () => {
		process.env.npm_config_user_agent = "bun/1.0.0";
		const ctx = await getContext(["proj"]);
		expect(ctx.packageManager).toBe("bun");
	});

	test("defaults to npm when no package manager detected", async () => {
		delete process.env.npm_config_user_agent;
		const ctx = await getContext(["proj"]);
		expect(ctx.packageManager).toBe("npm");
	});

	test("tasks array is initialized empty", async () => {
		const ctx = await getContext(["proj"]);

		expect(ctx.tasks).toEqual([]);
	});
});
