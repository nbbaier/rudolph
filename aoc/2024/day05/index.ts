import toposort from "toposort";
import { getMiddleIndex } from "@/utils";

function parse(input: string) {
	const contents = input.trim().split("\n\n");
	const rules = contents[0].split("\n");
	const updates = contents[1].split("\n").map((update) => update.split(","));
	return { rules, updates };
}

/**
 * Validates an update against a set of rules.
 *
 * @param update - An array of strings representing the update to be validated.
 * @param rules - An array of strings representing the rules to validate against.
 * @returns A boolean indicating whether all non-null rule results are true.
 */
function validateUpdate(update: string[], rules: string[]) {
	const ruleResults = [];

	for (const rule of rules) {
		const res = checkOrder(update, rule);
		ruleResults.push(res);
	}
	return ruleResults.filter((r) => r !== null).every(Boolean);
}

/**
 * Checks the order of two elements in an array based on a given rule.
 *
 * @param arr - The array of strings to check.
 * @param rule - A string containing two elements separated by a pipe ("|") character.
 *               The function checks if the first element appears before the second element in the array.
 * @returns `true` if the first element appears before the second element in the array,
 *          `false` if the first element appears after the second element,
 *          or `null` if either element is not found in the array.
 */
function checkOrder(arr: string[], rule: string): boolean | null {
	const [first, second] = rule.split("|");
	if (!arr.includes(first) || !arr.includes(second)) {
		return null;
	}
	return arr.indexOf(first) < arr.indexOf(second);
}

function part1(input: string): number | string {
	const { rules, updates } = parse(input);

	return updates
		.filter((update) => {
			return validateUpdate(update, rules);
		})
		.map((update) => {
			const i = getMiddleIndex(update) as number;
			return update[i];
		})
		.reduce((acc, curr) => {
			return acc + (curr !== null ? Number.parseInt(curr, 10) : 0);
		}, 0);
}

function part2(input: string): number | string {
	const { rules, updates } = parse(input);

	const incorrect = updates
		.filter((update) => !validateUpdate(update, rules))
		.map((update) => {
			return rules.filter((rule) => {
				const [first, second] = rule.split("|");
				return update.includes(first) && update.includes(second);
			});
		});

	const corrected = incorrect
		.map((update) => {
			const graph: [string, string][] = update.map((rule) => {
				const [from, to] = rule.split("|");
				return [from, to];
			});

			return graph;
		})
		.map((graph) => toposort(graph));

	return corrected
		.map((update) => {
			const i = getMiddleIndex(update) as number;
			return update[i];
		})
		.reduce((acc, curr) => {
			return acc + (curr !== null ? Number.parseInt(curr, 10) : 0);
		}, 0);
}

export default { p1: part1, p2: part2 };
