import path from "node:path";
import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath, loadFile } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2024";
const day = "01";
const dayPath = getDayPath(year, day);

const examples2: TestData[] = [
	{
		name: "=> 31",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 31,
	},
];
const examples1: TestData[] = [
	{
		name: "=> 11",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 11,
	},
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 01 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 01 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
