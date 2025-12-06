import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2015";
const day = "01";
const _dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{ input: "", output: 0 },
	{ input: "()()", output: 0 },
	{ input: "(((", output: 3 },
	{ input: "(()(()(", output: 3 },
	{ input: "))(((((", output: 3 },
	{ input: "())", output: -1 },
	{ input: "))(", output: -1 },
	{ input: ")))", output: -3 },
	{ input: ")())())", output: -3 },
];

const examples2: TestData[] = [
	{ input: ")", output: 1 },
	{ input: "()())", output: 5 },
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 01 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 01 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
