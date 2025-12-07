import chalk from "chalk";

export const color = {
	cyan: (text: string) => chalk.cyan(text),
	red: (text: string) => chalk.red(text),
	dim: (text: string) => chalk.dim(text),
	reset: (text: string) => chalk.reset(text),
	bold: (text: string) => chalk.bold(text),
	black: (text: string) => chalk.black(text),
	whiteBright: (text: string) => chalk.whiteBright(text),
	bgRed: (text: string) => chalk.bgRed(text),
	bgCyan: (text: string) => chalk.bgCyan(text),
};

export function label(
	text: string,
	...decorators: Array<(text: string) => string>
): string {
	let result = ` ${text} `;
	for (const decorator of decorators) {
		result = decorator(result);
	}
	return result;
}
