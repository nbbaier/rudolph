import { color, label } from "./colors";
import { getRandomFestiveMessage, sleep } from "./festive";

const stdout = process.stdout;

export const log = (message: string) => stdout.write(`${message}\n`);

export const info = async (prefix: string, text: string) => {
	await sleep(100);
	if (stdout.columns < 80) {
		log(`${" ".repeat(5)} ${color.cyan("◼")}  ${color.cyan(prefix)}`);
		log(`${" ".repeat(9)}${color.dim(text)}`);
	} else {
		log(
			`${" ".repeat(5)} ${color.cyan("◼")}  ${color.cyan(prefix)} ${color.dim(text)}`,
		);
	}
};

export const banner = (name?: string) => {
	const greeting = name ? `Hey ${name}! Let's` : "Let's";
	log(
		`${label("rudolph", color.bgRed, color.whiteBright)}  🎄 ${greeting} set up your Advent of Code workshop`,
	);
};

export const error = async (prefix: string, text: string) => {
	if (stdout.columns < 80) {
		log(`${" ".repeat(5)} ${color.red("▲")}  ${color.red(prefix)}`);
		log(`${" ".repeat(9)}${color.dim(text)}`);
	} else {
		log(
			`${" ".repeat(5)} ${color.red("▲")}  ${color.red(prefix)} ${color.dim(text)}`,
		);
	}
};

export const bannerAbort = () =>
	log(
		`\n${label("rudolph", color.bgRed, color.whiteBright)}  🎄 No Rudolph to guide the sleigh!`,
	);

export const nextSteps = async ({
	projectDir,
	pmPrefix,
}: {
	projectDir: string;
	pmPrefix: string;
}) => {
	const prefix = " ".repeat(3);
	await sleep(200);
	log(
		`\n ${color.bgCyan(` ${color.black("next")} `)}  ${color.bold(
			"Your Advent of Code workspace is ready!",
		)}`,
	);

	await sleep(100);
	if (projectDir && projectDir !== ".") {
		const dirPath = projectDir.includes(" ")
			? `"./${projectDir}"`
			: `./${projectDir}`;
		log(`\n${prefix}Enter your project directory:`);
		log(`${prefix}${color.cyan(`cd ${dirPath}`)}`);
	}

	await sleep(100);
	log(`\n${prefix}Setup a day (defaults to today):`);
	log(`${prefix}${color.cyan(`${pmPrefix} setup`)}`);

	await sleep(100);
	log(`\n${prefix}Run your solutions:`);
	log(
		`${prefix}${color.cyan(`${pmPrefix} run:input`)}   ${color.dim("# Run on real input")}`,
	);
	log(
		`${prefix}${color.cyan(`${pmPrefix} run:sample`)}  ${color.dim("# Run on sample input")}`,
	);

	await sleep(100);
	log(`\n${prefix}${color.cyan(getRandomFestiveMessage())}`);
	await sleep(200);
};
