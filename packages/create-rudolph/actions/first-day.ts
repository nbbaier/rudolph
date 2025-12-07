import { confirm, isCancel } from "@clack/prompts";
import type { Context } from "../context";
import { info } from "../messages";

export async function firstDay(
	ctx: Pick<Context, "cwd" | "firstDay" | "yes" | "dryRun" | "tasks">,
) {
	if (ctx.yes) {
		ctx.firstDay = true;
		await info("first day", "true");
		return;
	}
	let _firstDay: boolean | symbol = ctx.firstDay ?? ctx.yes ?? false;
	if (_firstDay === false) {
		_firstDay = await confirm({
			message: "Scaffold Day 1 to get started immediately?",
			initialValue: true,
		});

		if (isCancel(_firstDay)) {
			_firstDay = false;
		}
	}

	if (!_firstDay) {
		await info("Skipped", `Run 'rudolph setup' whenever you're ready to start`);
		return;
	}
}
