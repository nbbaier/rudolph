import { describe } from "vitest";
import type { TestData } from "@/types";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const _year = "2015";
const _day = "03";

const examples1: TestData[] = [
	{ input: ">", output: 2 },
	{ input: "^>v<", output: 4 },
	{ input: "^v^v^v^v^v", output: 2 },
];

const examples2: TestData[] = [
	{ input: "^v", output: 3 },
	{ input: "^>v<", output: 3 },
	{ input: "^v^v^v^v^v", output: 11 },
];

const testMap1 = createTestMap(examples1);
const testMap2 = createTestMap(examples2);

describe("day 03 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});

describe("day 03 part 2", () => {
	createTestSet(testMap2, solution, "p2");
});
