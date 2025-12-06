import path from "node:path";
import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath, loadFile } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2024";
const day = "19";
const dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{
		name: "tests for p1",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 6,
	},
];
const examples2: TestData[] = [
	{
		name: "tests for p2",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 0,
	},
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 19 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 19 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
