/**
 * Represents a problem with an input and expected output.
 *
 * @typedef {Object} Problem
 * @property {number[]} input - An array of numbers representing the input for the problem.
 * @property {number} output - The expected output for the given input.
 */
type Problem = {
	input: number[];
	output: number;
};

/**
 * Evaluates an expression based on the provided input numbers and operation set.
 *
 * @param input - An array of numbers to be used in the evaluation.
 * @param opSet - An array of strings representing the operations to be applied between the numbers.
 *                Supported operations are:
 *                - "+" for addition
 *                - "||" for concatenation (numbers are concatenated as strings)
 *                - Any other string for multiplication
 * @returns The result of evaluating the expression.
 */
function evalExpr(input: number[], opSet: string[]): number {
	let res = input[0];

	for (let i = 0; i < opSet.length; i++) {
		const op = opSet[i];
		if (op === "+") {
			res = res + input[i + 1];
		} else if (op === "||") {
			res = Number(`${res}${input[i + 1]}`);
		} else {
			res = res * input[i + 1];
		}
	}

	return res;
}

/**
 * Parses the input string into an array of Problem objects.
 *
 * @param input - The input string to parse, where each line represents a problem in the format "output: input".
 * @returns An array of Problem objects, each containing an output number and an array of input numbers.
 */
function parse(input: string): Problem[] {
	return input
		.trim()
		.split("\n")
		.map((line) => {
			const [output, input] = line.split(":");
			return {
				input: input.trim().split(" ").map(Number),
				output: Number(output),
			};
		});
}

/**
 * Generates all possible combinations of multiplication (*) and addition (+) operators
 * for a given number of operands.
 *
 * @param n - The number of operands. The number of operators will be `n - 1`.
 * @returns An array of string arrays, where each string array represents a combination
 * of operators. Each operator is either "*" or "+".
 *
 * @example
 * ```typescript
 * generateOpSets(3);
 * // Returns:
 * // [
 * //   ["*", "*"],
 * //   ["*", "+"],
 * //   ["+", "*"],
 * //   ["+", "+"]
 * // ]
 * ```
 */
function generateOpSets(n: number): string[][] {
	const operators: number = n - 1;
	const totalCombinations: number = 2 ** operators;

	const combinations: string[][] = [];
	for (let i = 0; i < totalCombinations; i++) {
		const binary = i.toString(2).padStart(operators, "0");
		const opCombination = binary
			.split("")
			.map((bit) => (bit === "0" ? "*" : "+"));
		combinations.push(opCombination);
	}

	return combinations;
}

/**
 * Generates all possible combinations of ternary operators for a given number of operands.
 * The operators used are "*", "+", and "||".
 *
 * @param {number} n - The number of operands.
 * @returns {string[][]} - A 2D array where each sub-array represents a unique combination of ternary operators.
 *
 * @example
 * ```typescript
 * generateTernaryOpSets(3);
 * // Returns:
 * // [
 * //   ["*", "*"],
 * //   ["*", "+"],
 * //   ["*", "||"],
 * //   ["+", "*"],
 * //   ["+", "+"],
 * //   ["+", "||"],
 * //   ["||", "*"],
 * //   ["||", "+"],
 * //   ["||", "||"]
 * // ]
 * ```
 */
function generateTernaryOpSets(n: number): string[][] {
	const operators: number = n - 1;
	const totalCombinations: number = 3 ** operators;

	const combinations: string[][] = [];
	for (let i = 0; i < totalCombinations; i++) {
		const ternary = i.toString(3).padStart(operators, "0");
		const opCombination = ternary.split("").map((digit) => {
			switch (digit) {
				case "0":
					return "*";
				case "1":
					return "+";
				case "2":
					return "||";
				default:
					throw new Error("Invalid operator");
			}
		});
		combinations.push(opCombination);
	}

	return combinations;
}

function part1(input: string) {
	const problems = parse(input);

	const safe: Problem[] = [];
	for (const problem of problems) {
		const { input, output } = problem;
		const opSets = generateOpSets(input.length);
		for (const opSet of opSets) {
			if (evalExpr(input, opSet) === output) {
				safe.push(problem);
				break;
			}
		}
	}

	return safe.reduce((acc, { output }) => acc + output, 0);
}

function part2(input: string) {
	const problems = parse(input);

	const safe: Problem[] = [];
	for (const problem of problems) {
		const { input, output } = problem;
		const opSets = generateTernaryOpSets(input.length);
		for (const opSet of opSets) {
			if (evalExpr(input, opSet) === output) {
				safe.push(problem);
				break;
			}
		}
	}

	return safe.reduce((acc, { output }) => acc + output, 0);
}

export default { p1: part1, p2: part2 };
