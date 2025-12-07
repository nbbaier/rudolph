import chalk from "chalk";

// Color utilities with chalk
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

// Label utility matching @astrojs/cli-kit
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

// Align utility matching @astrojs/cli-kit
export function align(
	text: string,
	dir: "start" | "end" | "center",
	len: number,
): string {
	const pad = Math.max(len - text.length, 0);
	switch (dir) {
		case "start":
			return text + " ".repeat(pad);
		case "end":
			return " ".repeat(pad) + text;
		case "center": {
			const left = Math.floor(pad / 2);
			const right = pad - left;
			return " ".repeat(left) + text + " ".repeat(right);
		}
	}
}

// Sleep utility matching @astrojs/cli-kit
export const sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

// Random utility matching @astrojs/cli-kit
export function random<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)] as T;
}
