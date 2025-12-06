const hasLargerDigits = (array: number[], n: number) => {
	return array.some((element) => element > n);
};

function part1(input: string): number | string {
	const banks = input
		.trim()
		.split("\n")
		.map((line) => line.split("").map(Number));

	console.log(new Set(banks.map((l) => l.length)));

	let total = 0;

	for (const bank of banks) {
		const firstDigit = bank.slice(0, -1).sort((a, b) => b - a)[0];
		const secondDigit = bank
			.slice(bank.indexOf(firstDigit) + 1)
			.sort((a, b) => b - a)[0];
		const pair = Number(`${firstDigit}${secondDigit}`);
		total += pair;
	}

	return total;
}

function part2(input: string): number | string {
	const banks = input
		.trim()
		.split("\n")
		.map((line) => line.split("").map(Number));

	const joltages: string[] = [];

	for (const bank of banks) {
		const includedBatteries: string[] = [];
		for (let i = 0; i <= bank.length - 1; i++) {
			const digit = bank[i];
			const remainingPositions = bank.slice(i).length;
			const needed = 12 - includedBatteries.length;
			const positionsToCheck = bank.slice(i + 1);
			const remainingCheck = remainingPositions - 1 >= needed;
			const hasLargerDigitsCheck = hasLargerDigits(positionsToCheck, digit);
			const skip =
				(bank[i + 1] > bank[i] ||
					(bank[i + 1] === bank[i] && hasLargerDigitsCheck)) &&
				remainingCheck;
			if (!skip) {
				includedBatteries.push(digit.toString());
			}

			if (includedBatteries.length === 12) break;
		}
		// console.log(includedBatteries.length);
		joltages.push(includedBatteries.join(""));
	}

	console.log(joltages.every((joltage) => joltage.length === 12));

	return joltages.reduce((a, c) => a + Number(c), 0);
}

export default { p1: part1, p2: part2 };
