import fs from "node:fs";
import path from "node:path";
import { confirm, isCancel } from "@clack/prompts";
import type { Context } from "../context";
import { exec } from "../lib/exec";
import { color } from "../ui/colors";
import { error, info } from "../ui/messages";

export async function git(
	ctx: Pick<Context, "cwd" | "git" | "yes" | "dryRun" | "tasks">,
) {
	if (fs.existsSync(path.join(ctx.cwd, ".git"))) {
		await info("Nice!", `Git has already been initialized`);
		return;
	}

	if (ctx.yes) {
		ctx.git = true;
		await info("git", "true");
	}

	let _git: boolean | symbol = ctx.git ?? ctx.yes ?? false;

	if (_git === false) {
		_git = await confirm({
			message: "Initialize a git repository and make an initial commit?",
			initialValue: true,
		});

		if (isCancel(_git)) {
			_git = false;
		}
	}

	if (ctx.dryRun) {
		await info("--dry-run", `Skipping Git initialization`);
	} else if (_git) {
		ctx.tasks.push({
			pending: "Git",
			start: "Git initializing...",
			end: "Git initialized",
			while: () => init({ cwd: ctx.cwd }),
			onError: (e) => {
				error("error", String(e));
			},
		});
	} else {
		await info(
			"Skipped",
			`You can run ${color.reset("git init")} later if you'd like`,
		);
	}
}

async function init({ cwd }: { cwd: string }) {
	await exec("git", ["init"], { cwd });
	await exec("git", ["add", "-A"], { cwd });
	await exec("git", ["commit", "-m", "Initial commit from create-rudolph"], {
		cwd,
	});
}
