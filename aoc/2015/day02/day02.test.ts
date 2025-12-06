import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2015";
const day = "02";
const _dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{ input: "2x3x4", output: 58 },
	{ input: "1x1x10", output: 43 },
];
const examples2: TestData[] = [
	{ input: "2x3x4", output: 10 + 24 },
	{ input: "1x1x10", output: 4 + 10 },
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 02 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 02 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
