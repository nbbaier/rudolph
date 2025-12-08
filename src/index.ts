import { createRequire } from "node:module";
import { Command } from "commander";
import { answerCommand } from "./commands/answer";
import { guessesCommand } from "./commands/guesses";
import { initCommand } from "./commands/init";
import { inputCommand } from "./commands/input";
import { puzzleCommand } from "./commands/puzzle";
import { refreshCommand } from "./commands/refresh";
import { runCommand } from "./commands/run";
import { setupCommand } from "./commands/setup";
import { statusCommand } from "./commands/status";
import { loadEnvFile } from "./env";
import { RudolphError } from "./errors";
import {
	type DayYearOptions,
	daySchema,
	getDefaultDay,
	getDefaultYear,
	withDayYearArguments,
	yearSchema,
} from "./utils/cli-helpers";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };

loadEnvFile();

const program = new Command();

program
	.name("rudolph")
	.description(
		"Advent of Code CLI - setup, run, submit, and track AoC solutions",
	)
	.version(version);

program
	.command("init")
	.description(
		"Initialize a new Advent of Code workspace in the current directory",
	)
	.option("-y, --yes", "Skip prompts and use defaults")
	.option("--dry-run", "Show what would be done without making changes")
	.option("--pm <manager>", "Package manager to use (npm, bun, yarn, pnpm)")
	.option(
		"--solutions-dir <dir>",
		"Folder for daily solutions (default: solutions)",
	)
	.option("--git", "Initialize git repository")
	.option("--no-git", "Do not initialize git repository")
	.option("--install", "Install dependencies")
	.option("--no-install", "Do not install dependencies")
	.action(
		async (options: {
			yes?: boolean;
			dryRun?: boolean;
			pm?: string;
			solutionsDir?: string;
			git?: boolean;
			install?: boolean;
		}) => {
			await initCommand({
				yes: options.yes,
				dryRun: options.dryRun,
				packageManager: options.pm,
				solutionsDir: options.solutionsDir,
				git: options.git,
				install: options.install,
			});
		},
	);

withDayYearArguments(
	program
		.command("setup")
		.description(
			"Create day folder, templates, sample stub, and fetch input+puzzle",
		)
		.option("-f, --force", "Force overwrite existing day (may erase work)"),
).action(async (yearArg: string, dayArg: string, options: DayYearOptions) => {
	const day = daySchema.parse(dayArg);
	const year = yearSchema.parse(yearArg);
	await setupCommand(year, day, options.force || false, options.outputDir);
});

withDayYearArguments(
	program
		.command("input")
		.description("Download puzzle input to input.txt")
		.option("-f, --force", "Force re-download even if files exist"),
).action(async (yearArg: string, dayArg: string, options: DayYearOptions) => {
	const day = daySchema.parse(dayArg);
	const year = yearSchema.parse(yearArg);
	await inputCommand(year, day, options.force || false, options.outputDir);
});

program
	.command("run")
	.description("Run solution against sample or input with timing")
	.argument("<target>", "sample | input")
	.argument("[year]", "Year (e.g., 2024)", getDefaultYear())
	.argument("[day]", "Day number (1-25)", getDefaultDay())
	.argument("[part]", "Which part to run (1, 2, or both)", "both")
	.option("-o, --output-dir <dir>", "Output directory for generated files")
	.action(
		async (
			target: string,
			yearArg: string,
			dayArg: string,
			partArg: "1" | "2" | "both",
			options: { outputDir?: string },
		) => {
			const normalizedTarget =
				target === "sample" || target === "input" ? target : undefined;
			if (!normalizedTarget) {
				throw new RudolphError('run target must be "sample" or "input"');
			}
			const day = daySchema.parse(dayArg);
			const year = yearSchema.parse(yearArg);
			await runCommand(year, day, normalizedTarget, options.outputDir, partArg);
		},
	);

program
	.command("answer")
	.description("Run solution against input.txt and submit to AoC")
	.argument("<year>", "Year (e.g., 2024)")
	.argument("<day>", "Day number (1-25)")
	.argument("<part>", "Which part to submit (1, 2, or both)")
	.option("-o, --output-dir <dir>", "Output directory for generated files")
	.option("--no-refresh", "Skip auto-refresh after correct part 1")
	.action(
		async (
			yearArg: string,
			dayArg: string,
			partArg: DayYearOptions["part"],
			options: { outputDir?: string; refresh?: boolean },
		) => {
			const day = daySchema.parse(dayArg);
			const year = yearSchema.parse(yearArg);
			const refresh = options.refresh !== false;
			await answerCommand(
				year,
				day,
				partArg ?? "1",
				options.outputDir,
				refresh,
			);
		},
	);

withDayYearArguments(
	program
		.command("guesses")
		.description("Show guess history for a day")
		.option("--json", "Output JSON"),
).action(
	async (
		yearArg: string,
		dayArg: string,
		options: DayYearOptions & { json?: boolean },
	) => {
		const day = daySchema.parse(dayArg);
		const year = yearSchema.parse(yearArg);
		await guessesCommand(year, day, options.outputDir, options.json);
	},
);

program
	.command("stars")
	.description("Show stars for a year using recorded guesses")
	.argument("[year]", "Year (e.g., 2024)", getDefaultYear())
	.option("-o, --output-dir <dir>", "Output directory for generated files")
	.option("--json", "Output JSON")
	.action(
		async (
			yearArg: string,
			options: { outputDir?: string; json?: boolean },
		) => {
			const year = yearSchema.parse(yearArg);
			await statusCommand(year, options.outputDir, options.json);
		},
	);

withDayYearArguments(
	program
		.command("puzzle")
		.description("Download puzzle to puzzle.md (uses cache if present)")
		.option("-f, --force", "Force re-download even if files exist")
		.option("--no-print", "Do not print puzzle to stdout"),
).action(
	async (
		yearArg: string,
		dayArg: string,
		options: DayYearOptions & { print?: boolean },
	) => {
		const day = daySchema.parse(dayArg);
		const year = yearSchema.parse(yearArg);
		const print = options.print !== false;
		await puzzleCommand(
			year,
			day,
			options.force || false,
			options.outputDir,
			print,
		);
	},
);

withDayYearArguments(
	program
		.command("refresh")
		.description(
			"Re-download puzzle (blocks unless part 1 complete; --force overrides)",
		)
		.option("-f, --force", "Force refresh even if part 1 not complete"),
).action(async (yearArg: string, dayArg: string, options: DayYearOptions) => {
	const day = daySchema.parse(dayArg);
	const year = yearSchema.parse(yearArg);
	await refreshCommand(year, day, options.force || false, options.outputDir);
});

program.parseAsync().catch((error: unknown) => {
	if (error instanceof RudolphError) {
		console.error(`Error: ${error.message}`);
	} else if (error instanceof Error) {
		console.error(`An error occurred: ${error.message}`);
	} else {
		console.error("An unknown error occurred");
	}
	process.exit(1);
});
