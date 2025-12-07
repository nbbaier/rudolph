import type { Context } from "../context";
import { error, info, title } from "../messages";

export async function getSession(
	ctx: Pick<
		Context,
		"aocSession" | "prompt" | "exit" | "aocSession" | "yes" | "dryRun"
	>,
) {
	if (ctx.yes) {
		ctx.aocSession = "FILL ME IN!";
		await error("session", ctx.aocSession);
		return;
	}
	const { session } = await ctx.prompt({
		name: "session",
		type: "text",
		label: title("token"),
		message: "What is your advent of code session token?",
		initial: "",
		mask: true,
		validate(value: string) {
			if (!value) {
				return "Session token is required";
			}
			return true;
		},
	});

	ctx.aocSession = session?.trim() ?? "";
	if (ctx.dryRun) {
		await info("--dry-run", "Skipping year selection");
		return;
	}

	const { aocSession } = ctx;

	if (!aocSession) {
		ctx.exit(1);
	}

	ctx.aocSession = aocSession;
}
