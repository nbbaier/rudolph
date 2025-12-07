import { afterEach, describe, expect, test } from "bun:test";
import {
	buildDayPaths,
	daySchema,
	getDefaultDay,
	getDefaultYear,
	yearSchema,
} from "./cli-helpers";

describe("daySchema", () => {
	test("accepts single digit day", () => {
		expect(daySchema.parse("1")).toBe("01");
		expect(daySchema.parse("5")).toBe("05");
		expect(daySchema.parse("9")).toBe("09");
	});

	test("accepts double digit day", () => {
		expect(daySchema.parse("10")).toBe("10");
		expect(daySchema.parse("25")).toBe("25");
		expect(daySchema.parse("01")).toBe("01");
	});

	test("pads single digit to two digits", () => {
		expect(daySchema.parse("1")).toBe("01");
		expect(daySchema.parse("9")).toBe("09");
	});

	test("rejects non-numeric strings", () => {
		expect(() => daySchema.parse("abc")).toThrow();
		expect(() => daySchema.parse("1a")).toThrow();
	});

	test("rejects three digit numbers", () => {
		expect(() => daySchema.parse("100")).toThrow();
	});

	test("rejects empty string", () => {
		expect(() => daySchema.parse("")).toThrow();
	});
});

describe("yearSchema", () => {
	test("accepts four digit year", () => {
		expect(yearSchema.parse("2024")).toBe("2024");
		expect(yearSchema.parse("2015")).toBe("2015");
		expect(yearSchema.parse("1999")).toBe("1999");
	});

	test("rejects three digit year", () => {
		expect(() => yearSchema.parse("999")).toThrow();
	});

	test("rejects five digit year", () => {
		expect(() => yearSchema.parse("20240")).toThrow();
	});

	test("rejects non-numeric strings", () => {
		expect(() => yearSchema.parse("abcd")).toThrow();
		expect(() => yearSchema.parse("202a")).toThrow();
	});

	test("rejects empty string", () => {
		expect(() => yearSchema.parse("")).toThrow();
	});
});

describe("getDefaultDay", () => {
	test("returns current day padded to two digits", () => {
		const result = getDefaultDay();
		const expected = new Date().getDate().toString().padStart(2, "0");
		expect(result).toBe(expected);
	});

	test("returns string of length 2", () => {
		const result = getDefaultDay();
		expect(result.length).toBe(2);
	});
});

describe("getDefaultYear", () => {
	const originalEnv = process.env.AOC_YEAR;

	afterEach(() => {
		if (originalEnv !== undefined) {
			process.env.AOC_YEAR = originalEnv;
		} else {
			delete process.env.AOC_YEAR;
		}
	});

	test("returns AOC_YEAR if set", () => {
		process.env.AOC_YEAR = "2020";
		expect(getDefaultYear()).toBe("2020");
	});

	test("returns four digit string", () => {
		delete process.env.AOC_YEAR;
		const result = getDefaultYear();
		expect(result.length).toBe(4);
		expect(/^\d{4}$/.test(result)).toBe(true);
	});
});

describe("buildDayPaths", () => {
	test("builds correct paths with default output dir", () => {
		const paths = buildDayPaths("2024", "05", "./solutions");

		expect(paths.dayPath).toContain("solutions/2024/day05");
		expect(paths.runner).toContain("solutions/2024/day05/index.ts");
		expect(paths.puzzle).toContain("solutions/2024/day05/puzzle.md");
		expect(paths.test).toContain("solutions/2024/day05/day05.test.ts");
		expect(paths.sample).toContain("solutions/2024/day05/sample.txt");
		expect(paths.input).toContain("solutions/2024/day05/input.txt");
		expect(paths.scratch).toContain("solutions/2024/day05/scratch.ts");
	});

	test("builds correct paths with custom output dir", () => {
		const paths = buildDayPaths("2023", "25", "/custom/path");

		expect(paths.dayPath).toBe("/custom/path/2023/day25");
		expect(paths.runner).toBe("/custom/path/2023/day25/index.ts");
		expect(paths.puzzle).toBe("/custom/path/2023/day25/puzzle.md");
	});

	test("does not pad day in buildDayPaths (getDayPath handles padding)", () => {
		const paths = buildDayPaths("2024", "1", "./aoc");

		expect(paths.dayPath).toContain("day01");
		expect(paths.test).toContain("day1.test.ts");
	});
});
