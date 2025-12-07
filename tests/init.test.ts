import { afterEach, describe, expect, it } from "bun:test";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { initInternals } from "../src/commands/init";

const { detectPackageManager, isEmpty, toValidName, generateEnvFile } =
	initInternals;

const created: string[] = [];

afterEach(async () => {
	for (const dir of created.splice(0)) {
		await fs.promises.rm(dir, { recursive: true, force: true });
	}
});

describe("initInternals", () => {
	it("sanitizes package names", () => {
		expect(toValidName("My App")).toBe("my-app");
		expect(toValidName("  __Weird__Name__ ")).toBe("weird-name");
	});

	it("detects package manager from npm_config_user_agent", () => {
		const original = process.env.npm_config_user_agent;
		process.env.npm_config_user_agent =
			"pnpm/8.6.0 npm/? node/v18.17.0 darwin arm64";
		expect(detectPackageManager()).toBe("pnpm");
		process.env.npm_config_user_agent = original;
	});

	it("treats safe-list directories as empty", async () => {
		const dir = await fs.promises.mkdtemp(path.join(tmpdir(), "rudolph-init-"));
		created.push(dir);
		await fs.promises.mkdir(path.join(dir, ".git"));
		expect(isEmpty(dir)).toBe(true);
		await fs.promises.writeFile(path.join(dir, "file.txt"), "x");
		expect(isEmpty(dir)).toBe(false);
	});

	it("quotes env values when needed", () => {
		const env = generateEnvFile({
			AOC_SESSION: "abc",
			OUTPUT_DIR: "./solutions path",
			AOC_YEAR: "2024",
			AOC_USER_AGENT: "me@example.com",
		});
		expect(env).toContain('OUTPUT_DIR="./solutions path"');
		expect(env).toContain("AOC_SESSION=abc");
	});
});
