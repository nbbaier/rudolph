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

const input = `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
`;

const lines = input.split("\n").filter((line) => line.length > 0);
const maxLen = Math.max(...lines.map((l) => l.length));
const paddedLines = lines.map((line) => line.padEnd(maxLen, " "));

const isWhitespaceColumn: boolean[] = [];
for (let i = 0; i < maxLen; i++) {
	isWhitespaceColumn[i] = paddedLines.every((line) => line[i] === " ");
}

// Find column ranges as [start, end) pairs
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
);

console.log(
	problems.reverse().map((l) => {
		return {
			operation: (l.pop() as string).trim(),
			numbers: transpose(l.map((n) => n.split("")))
				.map((m) => m.join("").trim())
				.map(Number),
		};
	}),
);
