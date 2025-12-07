import type { Context } from "../context";
import { info, title } from "../messages";

export async function getYear(
	ctx: Pick<
		Context,
		"aocYear" | "prompt" | "exit" | "aocYear" | "yes" | "dryRun"
	>,
) {
	if (ctx.yes) {
		ctx.aocYear = new Date().getFullYear().toString();
		await info("year", ctx.aocYear);
		return;
	}
	const { year } = await ctx.prompt({
		name: "year",
		type: "text",
		label: title("year"),
		message: "What year is this for?",
		initial: new Date().getFullYear().toString(),
		placeholder: new Date().getFullYear().toString(),
		finalize: (value: string) => {
			return value?.trim() ?? new Date().getFullYear().toString();
		},
	});

	ctx.aocYear = year?.trim() ?? "";
	if (ctx.dryRun) {
		await info("--dry-run", "Skipping year selection");
		return;
	}

	const { aocYear } = ctx;

	if (!aocYear) {
		ctx.exit(1);
	}

	ctx.aocYear = aocYear;
}
