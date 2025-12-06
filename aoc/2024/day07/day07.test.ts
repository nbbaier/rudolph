import path from "node:path";
import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath, loadFile } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2024";
const day = "07";
const dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{
		name: "=> 3749",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 3749,
	},
];
const examples2: TestData[] = [
	{
		name: "=> 11387",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 11387,
	},
];

const testMap1: TestMap = createTestMap(examples1);
const testMap2: TestMap = createTestMap(examples2);

describe("day 07 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 07 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
