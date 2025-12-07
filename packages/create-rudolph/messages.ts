import { shell } from "./shell";
import { align, color, label, sleep } from "./utils";

const stdout = process.stdout;

export const log = (message: string) => stdout.write(`${message}\n`);

export const title = (text: string) => `${align(label(text), "end", 7)} `;

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

export const banner = () => {
	log(
		`${label("rudolph", color.bgRed, color.whiteBright)}  🎄 Let's set up your Advent of Code workshop`,
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

let _registry: string;
async function getRegistry(packageManager: string): Promise<string> {
	if (_registry) return _registry;
	const fallback = "https://registry.npmjs.org";
	try {
		const { stdout } = await shell(packageManager, [
			"config",
			"get",
			"registry",
		]);
		_registry = stdout?.trim()?.replace(/\/$/, "") || fallback;
		// Detect cases where the shell command returned a non-URL (e.g. a warning)
		if (!new URL(_registry).host) _registry = fallback;
	} catch {
		_registry = fallback;
	}
	return _registry;
}

export const getVersion = async (
	packageManager: string,
	packageName: string,
	packageTag = "latest",
	fallback = "",
): Promise<string> => {
	const registry = await getRegistry(packageManager);
	try {
		const response = await fetch(`${registry}/${packageName}/${packageTag}`, {
			redirect: "follow",
		});
		const data = (await response.json()) as { version?: string };
		return data.version ?? fallback;
	} catch {
		return fallback;
	}
};
