import { exec } from "node:child_process";
import { stripVTControlCharacters } from "node:util";
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

export const getName = () =>
	new Promise<string>((resolve) => {
		exec("git config user.name", { encoding: "utf-8" }, (_1, gitName) => {
			if (gitName?.trim()) {
				return resolve(gitName?.split(" ")[0]?.trim() ?? "");
			}
			exec("whoami", { encoding: "utf-8" }, (_3, whoami) => {
				if (whoami?.trim()) {
					return resolve(whoami?.split(" ")[0]?.trim() ?? "");
				}
				return resolve("astronaut");
			});
		});
	});

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

export const nextSteps = async ({
	projectDir,
	devCmd,
}: {
	projectDir: string;
	devCmd: string;
}) => {
	const max = stdout.columns;
	const prefix = max < 80 ? " " : " ".repeat(9);
	await sleep(200);
	log(
		`\n ${color.bgCyan(` ${color.black("next")} `)}  ${color.bold(
			"Liftoff confirmed. Explore your project!",
		)}`,
	);

	await sleep(100);
	if (projectDir !== "") {
		projectDir = projectDir.includes(" ")
			? `"./${projectDir}"`
			: `./${projectDir}`;
		const enter = [
			`\n${prefix}Enter your project directory using`,
			color.cyan(`cd ${projectDir}`),
		];
		const len =
			(enter[0]?.length ?? 0) + stripVTControlCharacters(enter[1] ?? "").length;
		log(enter.join(len > max ? `\n${prefix}` : enter[1] ? ` ${prefix}` : ""));
	}
	log(
		`${prefix}Run ${color.cyan(devCmd)} to start the dev server. ${color.cyan("CTRL+C")} to stop.`,
	);
	await sleep(100);
	log(
		`${prefix}Add frameworks like ${color.cyan(`react`)} or ${color.cyan(
			"tailwind",
		)} using ${color.cyan("astro add")}.`,
	);
	await sleep(100);
	log(`\n${prefix}Stuck? Join us at ${color.cyan(`https://astro.build/chat`)}`);
	await sleep(200);
};

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
