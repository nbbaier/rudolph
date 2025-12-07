import { confirm, isCancel } from "@clack/prompts";
import type { Context } from "../context";
import { info, title } from "../messages";

export async function firstDay(
	ctx: Pick<Context, "cwd" | "firstDay" | "yes" | "dryRun" | "tasks">,
) {
	if (ctx.yes) {
		ctx.firstDay = true;
		await info("first day", "true");
		return;
	}
	let _firstDay: boolean | symbol = ctx.firstDay ?? ctx.yes ?? false;
	if (_firstDay === undefined || _firstDay === false) {
		_firstDay = await confirm({
			message: `${title("day")}Do you want to setup the first day?`,
			initialValue: true,
		});

		if (isCancel(_firstDay)) {
			_firstDay = false;
		}
	}

	if (!_firstDay) {
		await info(
			ctx.yes === false ? "firstDay [skip]" : "Sounds good!",
			`You can always set it up manually later.`,
		);
		return;
	}
}
