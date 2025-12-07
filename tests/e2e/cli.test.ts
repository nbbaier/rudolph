import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function runCli(
	args: string[],
	cwd: string,
): Promise<{ stdout: string; stderr: string; code: number | null }> {
	return new Promise((resolve) => {
		const proc = spawn("bun", ["run", "src/index.ts", ...args], {
			cwd: path.join(__dirname, "../.."),
			env: { ...process.env, FORCE_COLOR: "0" },
		});

		let stdout = "";
		let stderr = "";

		proc.stdout.on("data", (data) => {
			stdout += data.toString();
		});
		proc.stderr.on("data", (data) => {
			stderr += data.toString();
		});

		proc.on("close", (code) => {
			resolve({ stdout, stderr, code });
		});

		proc.on("error", (err) => {
			stderr += err.message;
			resolve({ stdout, stderr, code: 1 });
		});
	});
}

describe("CLI e2e tests", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-e2e-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	describe("rudolph --help", () => {
		test("shows help text", async () => {
			const { stdout, code } = await runCli(["--help"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toContain("rudolph");
			expect(stdout).toContain("Advent of Code CLI");
		});

		test("lists available commands", async () => {
			const { stdout, code } = await runCli(["--help"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toContain("init");
			expect(stdout).toContain("setup");
			expect(stdout).toContain("run");
			expect(stdout).toContain("answer");
			expect(stdout).toContain("puzzle");
		});
	});

	describe("rudolph --version", () => {
		test("shows version", async () => {
			const { stdout, code } = await runCli(["--version"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toMatch(/\d+\.\d+\.\d+/);
		});
	});

	describe("rudolph init --help", () => {
		test("shows init help", async () => {
			const { stdout, code } = await runCli(["init", "--help"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toContain("Initialize");
			expect(stdout).toContain("--yes");
			expect(stdout).toContain("--dry-run");
		});
	});

	describe("rudolph setup --help", () => {
		test("shows setup help", async () => {
			const { stdout, code } = await runCli(["setup", "--help"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toContain("Create day folder");
			expect(stdout).toContain("--force");
		});
	});

	describe("rudolph run --help", () => {
		test("shows run help", async () => {
			const { stdout, code } = await runCli(["run", "--help"], tempDir);

			expect(code).toBe(0);
			expect(stdout).toContain("Run solution");
			expect(stdout).toContain("sample");
			expect(stdout).toContain("input");
		});
	});
});
