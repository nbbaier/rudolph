import { isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { info } from "../messages";

export async function getYear(
	ctx: Pick<Context, "aocYear" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocYear = new Date().getFullYear().toString();
		await info("year", ctx.aocYear);
		return;
	}
	const year = await text({
		message: "Which year are you tackling?",
		initialValue: new Date().getFullYear().toString(),
		placeholder: new Date().getFullYear().toString(),
	});

	if (isCancel(year)) {
		ctx.exit(1);
	}

	ctx.aocYear =
		(year as string)?.trim() || new Date().getFullYear().toString();
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
