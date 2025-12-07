import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isEmpty, toValidName } from "./validation";

describe("isEmpty", () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "rudolph-validation-"));
	});

	afterEach(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});

	test("returns true for non-existent directory", () => {
		expect(isEmpty(path.join(tempDir, "does-not-exist"))).toBe(true);
	});

	test("returns true for empty directory", () => {
		const emptyDir = path.join(tempDir, "empty");
		fs.mkdirSync(emptyDir);
		expect(isEmpty(emptyDir)).toBe(true);
	});

	test("returns true for directory with only safe files", () => {
		const safeDir = path.join(tempDir, "safe");
		fs.mkdirSync(safeDir);
		fs.writeFileSync(path.join(safeDir, ".git"), "");
		fs.writeFileSync(path.join(safeDir, ".gitignore"), "");
		fs.writeFileSync(path.join(safeDir, ".DS_Store"), "");
		fs.writeFileSync(path.join(safeDir, "LICENSE"), "");
		expect(isEmpty(safeDir)).toBe(true);
	});

	test("returns false for directory with conflicting files", () => {
		const conflictDir = path.join(tempDir, "conflict");
		fs.mkdirSync(conflictDir);
		fs.writeFileSync(path.join(conflictDir, "package.json"), "{}");
		expect(isEmpty(conflictDir)).toBe(false);
	});

	test("returns false for directory with src folder", () => {
		const srcDir = path.join(tempDir, "with-src");
		fs.mkdirSync(srcDir);
		fs.mkdirSync(path.join(srcDir, "src"));
		expect(isEmpty(srcDir)).toBe(false);
	});

	test("allows npm-debug.log files", () => {
		const logDir = path.join(tempDir, "logs");
		fs.mkdirSync(logDir);
		fs.writeFileSync(path.join(logDir, "npm-debug.log"), "");
		fs.writeFileSync(path.join(logDir, "npm-debug.log.123"), "");
		expect(isEmpty(logDir)).toBe(true);
	});

	test("allows yarn log files", () => {
		const logDir = path.join(tempDir, "yarn-logs");
		fs.mkdirSync(logDir);
		fs.writeFileSync(path.join(logDir, "yarn-debug.log"), "");
		fs.writeFileSync(path.join(logDir, "yarn-error.log"), "");
		expect(isEmpty(logDir)).toBe(true);
	});

	test("allows .iml files", () => {
		const imlDir = path.join(tempDir, "idea");
		fs.mkdirSync(imlDir);
		fs.writeFileSync(path.join(imlDir, "project.iml"), "");
		expect(isEmpty(imlDir)).toBe(true);
	});
});

describe("toValidName", () => {
	test("returns valid name unchanged", () => {
		expect(toValidName("my-project")).toBe("my-project");
		expect(toValidName("advent2024")).toBe("advent2024");
		expect(toValidName("@scope/package")).toBe("@scope/package");
	});

	test("converts to lowercase", () => {
		expect(toValidName("MyProject")).toBe("myproject");
		expect(toValidName("ADVENT")).toBe("advent");
	});

	test("replaces spaces with hyphens", () => {
		expect(toValidName("my project")).toBe("my-project");
		expect(toValidName("advent of code")).toBe("advent-of-code");
	});

	test("removes leading dots and underscores", () => {
		expect(toValidName(".hidden")).toBe("hidden");
		expect(toValidName("_private")).toBe("private");
	});

	test("replaces invalid characters with hyphens", () => {
		expect(toValidName("my@project!")).toBe("my-project");
		expect(toValidName("hello$world")).toBe("hello-world");
	});

	test("preserves valid names with leading hyphens", () => {
		expect(toValidName("---project")).toBe("---project");
	});

	test("preserves valid names with trailing hyphens", () => {
		expect(toValidName("project---")).toBe("project---");
	});

	test("trims whitespace and processes invalid names", () => {
		expect(toValidName("  my-project  ")).toBe("my-project");
	});

	test("handles complex invalid names", () => {
		expect(toValidName("  .My Cool Project!  ")).toBe("my-cool-project");
		expect(toValidName("___test___")).toBe("test");
	});
});
