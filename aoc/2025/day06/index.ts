function transpose<T>(matrix: T[][]): T[][] {
	if (!matrix.length || !matrix[0].length) return [];
	const rows = matrix.length;
	const cols = matrix[0].length;
	const result = Array(cols);
	for (let j = 0; j < cols; j++) {
		result[j] = Array(rows);
		for (let i = 0; i < rows; i++) {
			result[j][i] = matrix[i][j];
		}
	}
	return result;
}

function part1(input: string): number | string {
	const problems = transpose<string>(
		input
			.trim()
			.split("\n")
			.map((l) => l.trim().split(/\s+/)),
	);
	let total = 0;
	for (const p of problems) {
		const operation = p.pop() as string;
		const numbers = p.map(Number);
		const result =
			operation === "*"
				? numbers.reduce((a, c) => a * c, 1)
				: numbers.reduce((a, c) => a + c, 0);
		total += result;
	}

	return total;
}

function part2(input: string): number | string {
	const lines = input.split("\n").filter((line) => line.length > 0);
	const maxLen = Math.max(...lines.map((l) => l.length));
	const paddedLines = lines.map((line) => line.padEnd(maxLen, " "));
	const isWhitespaceColumn: boolean[] = [];
	for (let i = 0; i < maxLen; i++) {
		isWhitespaceColumn[i] = paddedLines.every((line) => line[i] === " ");
	}
	const columnRanges: [number, number][] = [];
	let inContent = false;
	let contentStart = 0;

	for (let i = 0; i < maxLen; i++) {
		if (!isWhitespaceColumn[i] && !inContent) {
			contentStart = i;
			inContent = true;
		} else if (isWhitespaceColumn[i] && inContent) {
			columnRanges.push([contentStart, i]);
			inContent = false;
		}
	}
	if (inContent) {
		columnRanges.push([contentStart, maxLen]);
	}

	const problems = transpose<string>(
		paddedLines.map((line) => {
			return columnRanges.map(([start, end]) => line.slice(start, end));
		}),
	).map((l) => {
		return {
			operation: (l.pop() as string).trim(),
			numbers: transpose(l.map((n) => n.split("")))
				.map((m) => m.join("").trim())
				.map(Number),
		};
	});

	// for (const { operation, numbers } of problems) {
	// 	const result =
	// 		operation === "*"
	// 			? numbers.reduce((a, c) => a * c, 1)
	// 			: numbers.reduce((a, c) => a + c, 0);
	// 	total += result;
	// }

	return problems
		.map(({ operation, numbers }) => {
			return operation === "*"
				? numbers.reduce((a, c) => a * c, 1)
				: numbers.reduce((a, c) => a + c, 0);
		})
		.reduce((a, c) => a + c, 0);
}

export default { p1: part1, p2: part2 };
