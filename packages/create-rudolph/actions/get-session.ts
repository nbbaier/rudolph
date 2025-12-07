import { confirm, isCancel, password } from "@clack/prompts";
import type { Context } from "../context";
import { info } from "../messages";

export async function getSession(
	ctx: Pick<Context, "aocSession" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocSession = "FILL_ME_IN";
		await info(
			"session",
			"Set to FILL_ME_IN in .env; update it with your AoC session cookie before fetching inputs.",
		);
		return;
	}

	const wantsSession = await confirm({
		message:
			"Download puzzle inputs automatically? (requires your AoC session cookie, stored locally in .env)",
		initialValue: true,
	});

	if (isCancel(wantsSession)) {
		ctx.exit(1);
	}

	if (!wantsSession) {
		await info("Skipped", "You can add your session cookie to .env later.");
		return;
	}

	const session = await password({
		message:
			"Paste your 'session' cookie from adventofcode.com (found in browser dev tools):",
	});

	if (isCancel(session)) {
		ctx.exit(1);
	}

	ctx.aocSession = typeof session === "string" ? session.trim() : "";

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping session storage");
	}
}
