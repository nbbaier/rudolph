import pc from "picocolors";

// Color utilities with picocolors
export const color = {
	cyan: (text: string) => pc.cyan(text),
	red: (text: string) => pc.red(text),
	dim: (text: string) => pc.dim(text),
	reset: (text: string) => pc.reset(text),
	bold: (text: string) => pc.bold(text),
	black: (text: string) => pc.black(text),
	whiteBright: (text: string) => pc.whiteBright(text),
	bgRed: (text: string) => pc.bgRed(text),
	bgCyan: (text: string) => pc.bgCyan(text),
	bgGreen: (text: string) => pc.bgGreen(text),
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

// Strip ANSI escape codes for accurate length calculation
function stripAnsi(text: string): string {
	// biome-ignore lint/suspicious/noControlCharactersInRegex: we want to strip ANSI escape codes
	return text.replace(/\x1B\[[0-9;]*m/g, "");
}

// Align utility matching @astrojs/cli-kit
export function align(
	text: string,
	dir: "start" | "end" | "center",
	len: number,
): string {
	const visualLength = stripAnsi(text).length;
	const pad = Math.max(len - visualLength, 0);
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
	if (arr.length === 0) {
		throw new Error("Cannot select a random element from an empty array.");
	}
	// biome-ignore lint/style/noNonNullAssertion: Array access is safe after length check
	return arr[Math.floor(Math.random() * arr.length)]!;
}

// Festive messages for the end of setup
const FESTIVE_MESSAGES = [
	"May your algorithms be merry and bright! 🌟",
	"Rudolph's nose is glowing—you're all set! 🔴",
	"Time to unwrap some puzzles! 🎁",
	"Let the coding festivities begin! 🎄",
	"Your sleigh is fueled and ready! 🛷",
	"Ho ho ho! Time to solve some puzzles! 🎅",
	"Jingle all the way to the leaderboard! 🔔",
	"Deck the halls with lines of code! 💻",
];

export function getRandomFestiveMessage(): string {
	return random(FESTIVE_MESSAGES);
}
