import fs from "node:fs";
import path from "node:path";
import { confirm, isCancel } from "@clack/prompts";
import type { Context } from "../context";
import { error, info } from "../messages";
import { shell } from "../shell";
import { color } from "../utils";

export async function dependencies(
	ctx: Pick<
		Context,
		"install" | "yes" | "packageManager" | "cwd" | "dryRun" | "tasks"
	>,
) {
	let deps: boolean | symbol = ctx.install ?? ctx.yes ?? false;
	if (deps === undefined || deps === false) {
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
						ctx.packageManager + " install",
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
	return shell(packageManager, ["install"], {
		cwd,
		timeout: 90_000,
		stdio: "ignore",
	});
}

/**
 * Yarn Berry (PnP) versions will throw an error if there isn't an existing `yarn.lock` file
 * If a `yarn.lock` file doesn't exist, this function writes an empty `yarn.lock` one.
 * Unfortunately this hack is required to run `yarn install`.
 *
 * The empty `yarn.lock` file is immediately overwritten by the installation process.
 * See https://github.com/withastro/astro/pull/8028
 */
async function ensureYarnLock({ cwd }: { cwd: string }) {
	const yarnLock = path.join(cwd, "yarn.lock");
	if (fs.existsSync(yarnLock)) return;
	return fs.promises.writeFile(yarnLock, "", { encoding: "utf-8" });
}
