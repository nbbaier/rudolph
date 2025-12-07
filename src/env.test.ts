import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
	getAoCHeaders,
	getOutputDir,
	getSession,
	getUserAgent,
	loadEnvFile,
} from "./env";

describe("env", () => {
	let tempDir: string;
	let originalCwd: string;
	let originalEnv: NodeJS.ProcessEnv;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-env-"));
		originalCwd = process.cwd();
		originalEnv = { ...process.env };
	});

	afterEach(() => {
		process.chdir(originalCwd);
		process.env = originalEnv;
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	describe("loadEnvFile", () => {
		test("loads env file from current directory", () => {
			const envContent = "TEST_VAR_LOAD=hello\nANOTHER_LOAD=world";
			fs.writeFileSync(path.join(tempDir, ".env"), envContent);

			loadEnvFile(tempDir);

			expect(process.env.TEST_VAR_LOAD).toBe("hello");
			expect(process.env.ANOTHER_LOAD).toBe("world");
		});

		test("loads env file from parent directory", () => {
			const subDir = path.join(tempDir, "subdir");
			fs.mkdirSync(subDir);
			fs.writeFileSync(path.join(tempDir, ".env"), "PARENT_VAR_TEST=found");

			loadEnvFile(subDir);

			expect(process.env.PARENT_VAR_TEST).toBe("found");
		});

		test("ignores comments", () => {
			const envContent = "# This is a comment\nVALID_COMMENT=yes";
			fs.writeFileSync(path.join(tempDir, ".env"), envContent);

			loadEnvFile(tempDir);

			expect(process.env.VALID_COMMENT).toBe("yes");
		});

		test("ignores empty lines", () => {
			const envContent = "FIRST_EMPTY=one\n\n\nSECOND_EMPTY=two";
			fs.writeFileSync(path.join(tempDir, ".env"), envContent);

			loadEnvFile(tempDir);

			expect(process.env.FIRST_EMPTY).toBe("one");
			expect(process.env.SECOND_EMPTY).toBe("two");
		});

		test("strips quotes from values", () => {
			const envContent = "DOUBLE_QUOTE=\"quoted\"\nSINGLE_QUOTE='also quoted'";
			fs.writeFileSync(path.join(tempDir, ".env"), envContent);

			loadEnvFile(tempDir);

			expect(process.env.DOUBLE_QUOTE).toBe("quoted");
			expect(process.env.SINGLE_QUOTE).toBe("also quoted");
		});

		test("does not override existing env vars", () => {
			process.env.EXISTING_VAR = "original";
			fs.writeFileSync(path.join(tempDir, ".env"), "EXISTING_VAR=new");

			loadEnvFile(tempDir);

			expect(process.env.EXISTING_VAR).toBe("original");
		});

		test("handles lines without equals sign", () => {
			const envContent = "VALID_LINE=yes\nINVALID_LINE\nALSO_VALID_LINE=ok";
			fs.writeFileSync(path.join(tempDir, ".env"), envContent);

			loadEnvFile(tempDir);

			expect(process.env.VALID_LINE).toBe("yes");
			expect(process.env.ALSO_VALID_LINE).toBe("ok");
		});

		test("handles missing .env file gracefully", () => {
			expect(() => loadEnvFile(tempDir)).not.toThrow();
		});
	});

	describe("getSession", () => {
		test("returns AOC_SESSION value", () => {
			process.env.AOC_SESSION = "test-session-123";
			expect(getSession()).toBe("test-session-123");
		});

		test("returns undefined when not set", () => {
			delete process.env.AOC_SESSION;
			expect(getSession()).toBeUndefined();
		});
	});

	describe("getOutputDir", () => {
		test("returns OUTPUT_DIR value when set", () => {
			process.env.OUTPUT_DIR = "./custom-output";
			expect(getOutputDir()).toBe("./custom-output");
		});

		test("returns default ./aoc when not set", () => {
			delete process.env.OUTPUT_DIR;
			expect(getOutputDir()).toBe("./aoc");
		});
	});

	describe("getUserAgent", () => {
		test("includes email when valid AOC_USER_AGENT is set", () => {
			process.env.AOC_USER_AGENT = "test@example.com";
			const ua = getUserAgent();
			expect(ua).toContain("rudolph/");
			expect(ua).toContain("test@example.com");
		});

		test("returns default user agent when not set", () => {
			delete process.env.AOC_USER_AGENT;
			const ua = getUserAgent();
			expect(ua).toContain("rudolph/");
			expect(ua).toContain("github.com");
		});

		test("returns default when AOC_USER_AGENT is not valid email", () => {
			process.env.AOC_USER_AGENT = "not-an-email";
			const ua = getUserAgent();
			expect(ua).not.toContain("not-an-email");
			expect(ua).toContain("github.com");
		});
	});

	describe("getAoCHeaders", () => {
		test("includes User-Agent", () => {
			const headers = getAoCHeaders();
			expect(headers["User-Agent"]).toBeDefined();
			expect(headers["User-Agent"]).toContain("rudolph/");
		});

		test("includes Cookie when session is set", () => {
			process.env.AOC_SESSION = "my-session";
			const headers = getAoCHeaders();
			expect(headers.Cookie).toBe("session=my-session");
		});

		test("omits Cookie when session is not set", () => {
			delete process.env.AOC_SESSION;
			const headers = getAoCHeaders();
			expect(headers.Cookie).toBeUndefined();
		});
	});
});
