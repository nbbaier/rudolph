import type { Context } from "../context";
import { info, title } from "../messages";

export async function getEmail(
	ctx: Pick<Context, "aocUserAgent" | "prompt" | "exit" | "yes" | "dryRun">,
) {
	if (ctx.yes) {
		ctx.aocUserAgent = "FILL OUT MANUALLY";
		await info("email", ctx.aocUserAgent);
		return;
	}
	let _ua: boolean | undefined;

	if (ctx.aocUserAgent === undefined) {
		({ userAgent: _ua } = await ctx.prompt({
			name: "userAgent",
			type: "confirm",
			label: title("email"),
			message: `Add your email as the user agent?`,
			hint: "optional",
			initial: true,
		}));
	}

	if (!_ua) {
		await info(
			ctx.yes === false ? "git [skip]" : "Sounds good!",
			`You can always add it manually later.`,
		);
		return;
	}

	const { email } = await ctx.prompt({
		name: "email",
		type: "text",
		label: title("email"),
		message: "What is your email address?",
		placeholder: "example@example.com",
		initial: "",
		finalize: (value: string) => {
			return value?.trim() || "example@example.com";
		},
	});

	ctx.aocUserAgent = email?.trim() ?? "";
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
