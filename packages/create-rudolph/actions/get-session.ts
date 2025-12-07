import { isCancel, password } from "@clack/prompts";
import type { Context } from "../context";
import { error, info, title } from "../messages";

export async function getSession(
	ctx: Pick<Context, "aocSession" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocSession = "FILL ME IN!";
		await error("session", ctx.aocSession);
		return;
	}
	const session = await password({
		message: `${title("token")}What's your session cookie from adventofcode.com?`,
		validate(value: string) {
			if (!value) {
				return "Session token is required to fetch puzzle inputs";
			}
		},
	});

	if (isCancel(session)) {
		ctx.exit(1);
	}

	ctx.aocSession = (session as string)?.trim() ?? "";
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
