import type { Context } from "../context";
import { error, info, title } from "../messages";

export async function firstDay(
	ctx: Pick<
		Context,
		"cwd" | "firstDay" | "yes" | "prompt" | "dryRun" | "tasks"
	>,
) {
	if (ctx.yes) {
		ctx.firstDay = true;
		await info("first day", "true");
		return;
	}
	let _firstDay = ctx.firstDay ?? ctx.yes;
	if (_firstDay === undefined) {
		({ firstDay: _firstDay } = await ctx.prompt({
			name: "firstDay",
			type: "confirm",
			label: title("day"),
			message: `Do you want to setup the first day?`,
			hint: "optional",
			initial: true,
		}));
		console.log("firstDay", _firstDay);
	}

	if (!_firstDay) {
		await info(
			ctx.yes === false ? "firstDay [skip]" : "Sounds good!",
			`You can always set it up manually later.`,
		);
		return;
	}
}
