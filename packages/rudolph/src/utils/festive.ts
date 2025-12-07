import chalk from "chalk";

export const RUDOLPH_BANNER = `
${chalk.red("    🦌 RUDOLPH")}
${chalk.green("    Ready to guide your sleigh through the Advent of Code?")}
`;

const FESTIVE_MESSAGES = [
	"May your algorithms be merry and bright! 🌟",
	"Rudolph's nose is glowing—you're all set! 🔴",
	"Time to unwrap some puzzles! 🎁",
	"Let the coding festivities begin! 🎄",
	"Your sleigh is fueled and ready! 🛷",
];

export function getRandomFestiveMessage(): string {
	return FESTIVE_MESSAGES[Math.floor(Math.random() * FESTIVE_MESSAGES.length)];
}

export function printBanner(): void {
	console.log(RUDOLPH_BANNER);
}

export function printNextSteps(outputDir: string, day?: string): void {
	const cdCmd = outputDir !== "." ? `cd ${outputDir}` : null;
	const dayNum = day ?? "1";

	console.log();
	console.log(chalk.green("  🎄 Your workshop is ready!"));
	console.log();
	console.log(chalk.white("  Next steps:"));
	if (cdCmd) {
		console.log(chalk.gray(`  ├─ ${cdCmd}`));
	}
	console.log(
		chalk.gray(`  ${cdCmd ? "├" : "├"}─ rudolph setup ${dayNum}`) +
			chalk.dim("    # Unwrap a puzzle"),
	);
	console.log(
		chalk.gray(`  └─ rudolph run ${dayNum}`) +
			chalk.dim("      # Run your solution"),
	);
	console.log();
	console.log(chalk.yellow(`  ${getRandomFestiveMessage()}`));
	console.log();
}
