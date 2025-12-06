import path from "node:path";
import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { getDayPath, loadFile } from "@/utils";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const year = "2024";
const day = "14";
const dayPath = getDayPath(year, day);

const examples1: TestData[] = [
	{
		name: "tests for p1",
		input: loadFile(path.resolve(dayPath, "sample.txt")),
		output: 12,
	},
];

const testMap1: TestMap = createTestMap(examples1);

describe("day 14 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});
