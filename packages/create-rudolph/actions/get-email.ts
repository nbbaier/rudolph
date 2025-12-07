import { confirm, isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { getGitEmail } from "../git-utils";
import { info } from "../messages";

export async function getEmail(
	ctx: Pick<Context, "aocUserAgent" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocUserAgent = "FILL_ME_IN";
		await info(
			"email",
			"Set to FILL_ME_IN in .env; update it if you'd like to include a contact in the User-Agent.",
		);
		return;
	}
	let _ua: boolean | symbol = false;

	if (ctx.aocUserAgent === undefined) {
		_ua = await confirm({
			message:
				"Include an email in the User-Agent? (AoC recommends a contact for API usage; optional but polite)",
			initialValue: true,
		});

		if (isCancel(_ua)) {
			ctx.exit(1);
		}
	}

	if (!_ua) {
		await info("Skipped", "You can add an email to .env (AOC_USER_AGENT) later.");
		return;
	}

	// Try to get git email to pre-populate
	const gitEmail = await getGitEmail();

	const email = await text({
		message: "Email for User-Agent (any contact you're comfortable with):",
		placeholder: "your.email@example.com",
		initialValue: gitEmail || "",
	});

	if (isCancel(email)) {
		ctx.exit(1);
	}

	ctx.aocUserAgent = (email as string)?.trim() || "example@example.com";
	if (ctx.dryRun) {
		await info("--dry-run", "Skipping user agent");
		return;
	}

	const { aocUserAgent } = ctx;

	if (!aocUserAgent) {
		ctx.exit(1);
	}

	ctx.aocUserAgent = aocUserAgent;
}
