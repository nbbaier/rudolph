import { describe } from "vitest";
import type { TestData, TestMap } from "@/types";
import { createTestMap, createTestSet } from "@/utils/test";
import solution from ".";

const _year = "2015";
const _day = "04";

const examples1: TestData[] = [
	{ input: "abcdef", output: 609043 },
	{ input: "pqrstuv", output: 1048970 },
];
const testMap1: TestMap = createTestMap(examples1);

describe("day 04 part 1", () => {
	createTestSet(testMap1, solution, "p1");
});
