const testCases = [
	{
		input: `987654321111111`,
		expected: `987654321111`,
	},
	{
		input: `811111111111119`,
		expected: `811111111119`,
	},
	{
		input: `234234234234278`,
		expected: `434234234278`,
	},
	{
		input: `818181911112111`,
		expected: `888911112111`,
	},
];

const hasLargerDigits = (array: number[], n: number) => {
	return array.some((element) => element > n);
};

for (const { input, expected } of testCases) {
	const includedBatteries: string[] = [];
	const bank = input.split("").map(Number);
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
	console.log({
		joltage_: includedBatteries.join(""),
		expected,
		joltage_length: includedBatteries.join("").length,
		expected_length: expected.length,
		correct: includedBatteries.join("") === expected,
	});
}
