import { confirm, isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { info, title } from "../messages";

export async function getEmail(
	ctx: Pick<Context, "aocUserAgent" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocUserAgent = "FILL OUT MANUALLY";
		await info("email", ctx.aocUserAgent);
		return;
	}
	let _ua: boolean | symbol = false;

	if (ctx.aocUserAgent === undefined) {
		_ua = await confirm({
			message: `${title("email")}Add your email as the user agent?`,
			initialValue: true,
		});

		if (isCancel(_ua)) {
			ctx.exit(1);
		}
	}

	if (!_ua) {
		await info(
			ctx.yes === false ? "git [skip]" : "Sounds good!",
			`You can always add it manually later.`,
		);
		return;
	}

	const email = await text({
		message: `${title("email")}What is your email address?`,
		placeholder: "example@example.com",
		initialValue: "",
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
