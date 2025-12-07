import { createRequire } from "node:module";
import { Command } from "commander";
import { answerCommand } from "./commands/answer";
import { attemptCommand } from "./commands/attempt";
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
	withDayYearOptions,
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

withDayYearOptions(
	program
		.command("setup")
		.description(
			"Create day folder, templates, sample stub, and fetch input+puzzle",
		)
		.option("-f, --force", "Force overwrite existing day (may erase work)"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await setupCommand(year, day, options.force || false, options.outputDir);
});

withDayYearOptions(
	program
		.command("input")
		.description("Download puzzle input to input.txt")
		.option("-f, --force", "Force re-download even if files exist"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await inputCommand(year, day, options.force || false, options.outputDir);
});

program
	.command("init")
	.description("Interactive setup for a new AoC workspace")
	.action(async () => {
		await initCommand();
	});

program
	.command("run")
	.description("Run solution against sample or input with timing")
	.argument("<target>", "sample | input")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.option("-p, --part [part]", "Which part to run (1, 2, or both)", "both")
	.option("-o, --output-dir <dir>", "Output directory for generated files")
	.action(async (target: string, options: DayYearOptions) => {
		const normalizedTarget =
			target === "sample" || target === "input" ? target : undefined;
		if (!normalizedTarget) {
			throw new RudolphError('run target must be "sample" or "input"');
		}
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await runCommand(
			year,
			day,
			normalizedTarget,
			options.outputDir,
			options.part ?? "both",
		);
	});

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

withDayYearOptions(
	program
		.command("attempt")
		.description(
			"Run solution against input.txt, executing both parts and showing total time",
		)
		.option("-p, --part [part]", "Which part to run (1, 2, or both)", "both"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await attemptCommand(year, day, options.outputDir, options.part);
});

withDayYearOptions(
	program
		.command("guesses")
		.description("Show guess history for a day")
		.option("--json", "Output JSON"),
).action(async (options: DayYearOptions & { json?: boolean }) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await guessesCommand(year, day, options.outputDir, options.json);
});

program
	.command("stars")
	.description("Show stars for a year using recorded guesses")
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.option("-o, --output-dir <dir>", "Output directory for generated files")
	.option("--json", "Output JSON")
	.action(
		async (options: { year: string; outputDir?: string; json?: boolean }) => {
			const year = yearSchema.parse(options.year);
			await statusCommand(year, options.outputDir, options.json);
		},
	);

withDayYearOptions(
	program
		.command("puzzle")
		.description("Download puzzle to puzzle.md (uses cache if present)")
		.option("-f, --force", "Force re-download even if files exist")
		.option("--no-print", "Do not print puzzle to stdout"),
).action(async (options: DayYearOptions & { print?: boolean }) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	const print = options.print !== false;
	await puzzleCommand(
		year,
		day,
		options.force || false,
		options.outputDir,
		print,
	);
});

withDayYearOptions(
	program
		.command("refresh")
		.description(
			"Re-download puzzle (blocks unless part 1 complete; --force overrides)",
		)
		.option("-f, --force", "Force refresh even if part 1 not complete"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
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
