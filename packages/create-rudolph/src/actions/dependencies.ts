import fs from "node:fs";
import path from "node:path";
import { confirm, isCancel } from "@clack/prompts";
import type { Context } from "../context";
import { exec } from "../lib/exec";
import { color } from "../ui/colors";
import { error, info } from "../ui/messages";

export async function dependencies(
	ctx: Pick<
		Context,
		"install" | "yes" | "packageManager" | "cwd" | "dryRun" | "tasks"
	>,
) {
	let deps: boolean | symbol = ctx.install ?? ctx.yes ?? false;
	if (deps === false) {
		deps = await confirm({
			message: "Install dependencies?",
			initialValue: true,
		});

		if (isCancel(deps)) {
			deps = false;
		}

		ctx.install = deps as boolean;
	}

	if (ctx.dryRun) {
		await info("--dry-run", `Skipping dependency installation`);
	} else if (deps) {
		ctx.tasks.push({
			pending: "Dependencies",
			start: `Dependencies installing with ${ctx.packageManager}...`,
			end: "Dependencies installed",
			onError: (e) => {
				error("error", e as string);
				error(
					"error",
					`Dependencies failed to install, please run ${color.bold(
						`${ctx.packageManager} install`,
					)} to install them manually after setup.`,
				);
			},
			while: () =>
				install({ packageManager: ctx.packageManager, cwd: ctx.cwd }),
		});
	} else {
		await info(
			"Skipped",
			`Run ${ctx.packageManager} install when you're ready`,
		);
	}
}

async function install({
	packageManager,
	cwd,
}: {
	packageManager: string;
	cwd: string;
}) {
	if (packageManager === "yarn") await ensureYarnLock({ cwd });
	return exec(packageManager, ["install"], { cwd, timeout: 90_000 });
}

async function ensureYarnLock({ cwd }: { cwd: string }) {
	const yarnLock = path.join(cwd, "yarn.lock");
	if (fs.existsSync(yarnLock)) return;
	return fs.promises.writeFile(yarnLock, "", { encoding: "utf-8" });
}
