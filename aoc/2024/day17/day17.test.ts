import path from "node:path";
import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath, loadFile } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2024";
const day = "17";
const dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{
		name: "tests for p1",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: "4,6,3,5,6,3,5,2,1,0",
	},
];

const examples2: TestData[] = [
	{
		name: "tests for p2",
		input: loadFile(path.resolve(dayPath, "sample2.txt")),
		output: 117440,
	},
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 17 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 17 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
