import { Command } from "commander";
import { attemptCommand } from "./commands/attempt";
import { readCommand } from "./commands/read";
import { refreshCommand } from "./commands/refresh";
import { scaffoldCommand } from "./commands/scaffold";
import { tryCommand } from "./commands/try";
import { loadEnvFile } from "./env";
import { RudolphError } from "./errors";
import {
	type DayYearOptions,
	daySchema,
	withDayYearOptions,
	yearSchema,
} from "./utils/cli-helpers";

loadEnvFile();

const program = new Command();

program
	.name("rudolph")
	.description("Advent of Code CLI - scaffold, run, and manage AoC solutions")
	.version("1.0.0");

withDayYearOptions(
	program
		.command("scaffold")
		.description("Set up a new day (creates files, downloads input and puzzle)")
		.option("-f, --force", "Force re-download even if files exist"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await scaffoldCommand(year, day, options.force || false, options.outputDir);
});

withDayYearOptions(
	program
		.command("try")
		.alias("sample")
		.description("Run solution against sample.txt")
		.option("-p, --part <part>", "Which part to run (1, 2, or both)", "both"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await tryCommand(year, day, options.outputDir, options.part);
});

withDayYearOptions(
	program
		.command("attempt")
		.alias("run")
		.description(
			"Run solution against input.txt, executing both parts and showing total time",
		)
		.option("-p, --part <part>", "Which part to run (1, 2, or both)", "both"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await attemptCommand(year, day, options.outputDir, options.part);
});

withDayYearOptions(
	program
		.command("read")
		.description("Download puzzle description to puzzle.md")
		.option("-f, --force", "Force re-download even if files exist"),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await readCommand(year, day, options.force || false, options.outputDir);
});

withDayYearOptions(
	program
		.command("refresh")
		.description(
			"Re-download puzzle (useful after solving part 1 to get part 2)",
		),
).action(async (options: DayYearOptions) => {
	const day = daySchema.parse(options.day);
	const year = yearSchema.parse(options.year);
	await refreshCommand(year, day, options.outputDir);
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
