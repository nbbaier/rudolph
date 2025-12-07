import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createContext, detectPackageManager } from "./context";

describe("detectPackageManager", () => {
	let originalAgent: string | undefined;

	beforeEach(() => {
		originalAgent = process.env.npm_config_user_agent;
	});

	afterEach(() => {
		if (originalAgent !== undefined) {
			process.env.npm_config_user_agent = originalAgent;
		} else {
			delete process.env.npm_config_user_agent;
		}
	});

	test("detects npm", () => {
		process.env.npm_config_user_agent = "npm/10.0.0 node/v20.0.0";
		expect(detectPackageManager()).toBe("npm");
	});

	test("detects bun", () => {
		process.env.npm_config_user_agent = "bun/1.0.0";
		expect(detectPackageManager()).toBe("bun");
	});

	test("detects yarn", () => {
		process.env.npm_config_user_agent = "yarn/4.0.0 npm/? node/v20.0.0";
		expect(detectPackageManager()).toBe("yarn");
	});

	test("detects pnpm", () => {
		process.env.npm_config_user_agent = "pnpm/8.0.0 npm/? node/v20.0.0";
		expect(detectPackageManager()).toBe("pnpm");
	});

	test("defaults to npm when not set", () => {
		delete process.env.npm_config_user_agent;
		expect(detectPackageManager()).toBe("npm");
	});

	test("handles cnpm/npminstall", () => {
		process.env.npm_config_user_agent = "npminstall/5.0.0";
		expect(detectPackageManager()).toBe("cnpm");
	});
});

describe("createContext", () => {
	test("creates context with defaults", () => {
		const ctx = createContext({});
		expect(ctx.cwd).toBe(process.cwd());
		expect(ctx.tasks).toEqual([]);
		expect(ctx.packageManager).toBeDefined();
	});

	test("respects yes option", () => {
		const ctx = createContext({ yes: true });
		expect(ctx.yes).toBe(true);
	});

	test("respects dryRun option", () => {
		const ctx = createContext({ dryRun: true });
		expect(ctx.dryRun).toBe(true);
	});

	test("respects install option", () => {
		const ctx = createContext({ install: false });
		expect(ctx.install).toBe(false);
	});

	test("respects git option", () => {
		const ctx = createContext({ git: true });
		expect(ctx.git).toBe(true);
	});

	test("respects packageManager option", () => {
		const ctx = createContext({ packageManager: "bun" });
		expect(ctx.packageManager).toBe("bun");
	});

	test("exit function is defined", () => {
		const ctx = createContext({});
		expect(typeof ctx.exit).toBe("function");
	});
});
