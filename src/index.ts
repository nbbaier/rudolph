import { Command } from "commander";
import { attemptCommand } from "./commands/attempt";
import { readCommand } from "./commands/read";
import { refreshCommand } from "./commands/refresh";
import { scaffoldCommand } from "./commands/scaffold";
import { tryCommand } from "./commands/try";
import {
	daySchema,
	getDefaultDay,
	getDefaultYear,
	yearSchema,
} from "./utils/cli-helpers";

const program = new Command();

program.name("aoc").description("Advent of Code CLI").version("1.0.0");

program
	.command("scaffold")
	.description("Set up a new day (creates files, downloads input and puzzle)")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.option("-f, --force", "Force re-download even if files exist")
	.action(async (options) => {
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await scaffoldCommand(year, day, options.force || false);
	});

program
	.command("try")
	.description("Run solution against sample.txt")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.action(async (options) => {
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await tryCommand(year, day);
	});

program
	.command("attempt")
	.description("Run solution against input.txt (with timing)")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.action(async (options) => {
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await attemptCommand(year, day);
	});

program
	.command("read")
	.description("Download puzzle description to puzzle.md")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.option("-f, --force", "Force re-download even if files exist")
	.action(async (options) => {
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await readCommand(year, day, options.force || false);
	});

program
	.command("refresh")
	.description("Re-download puzzle (useful after solving part 1)")
	.option("-d, --day <day>", "Day number (1-25)", getDefaultDay())
	.option("-y, --year <year>", "Year (e.g., 2024)", getDefaultYear())
	.action(async (options) => {
		const day = daySchema.parse(options.day);
		const year = yearSchema.parse(options.year);
		await refreshCommand(year, day);
	});

program.parseAsync().catch((error) => {
	console.error("An error occurred:", error);
	process.exit(1);
});
