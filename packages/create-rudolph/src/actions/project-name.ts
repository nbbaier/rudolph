import path from "node:path";
import { isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { isEmpty, toValidName } from "../lib/validation";
import { color } from "../ui/colors";
import { info, log } from "../ui/messages";

export async function projectName(
	ctx: Pick<
		Context,
		"yes" | "dryRun" | "projectName" | "exit" | "tasks" | "cwd"
	>,
) {
	await checkCwd(ctx.cwd);

	if (!ctx.cwd || !isEmpty(ctx.cwd)) {
		if (ctx.cwd && !isEmpty(ctx.cwd)) {
			await info(
				"Hmm...",
				`${color.reset(`"${ctx.cwd}"`)}${color.dim(` is not empty!`)}`,
			);
		}

		if (ctx.yes) {
			ctx.projectName = "advent-of-code";
			ctx.cwd = path.resolve(`./${ctx.projectName}`);
			await info("dir", `Project will be created at ./${ctx.projectName}`);
			return;
		}

		const name = await text({
			message: "Where should we create your project?",
			placeholder: "advent-of-code",
			initialValue: "advent-of-code",
			validate(value: string) {
				if (!isEmpty(value)) {
					return `Directory is not empty!`;
				}
				if (value.match(/[^\x20-\x7E]/g) !== null)
					return `Invalid non-printable character present!`;
				return undefined;
			},
		});

		if (isCancel(name)) {
			ctx.exit(1);
		}

		const trimmedName = typeof name === "string" ? name.trim() : "";
		ctx.cwd = trimmedName;
		ctx.projectName = toValidName(trimmedName);
		if (ctx.dryRun) {
			await info("--dry-run", "Skipping project naming");
			return;
		}
	} else {
		let name = ctx.cwd;
		if (name?.trim() === "." || name?.trim() === "./") {
			const parts = process.cwd().split(path.sep);
			name = parts[parts.length - 1] ?? "";
		} else if (name?.startsWith("./") || name?.startsWith("../")) {
			const parts = name.split("/");
			name = parts[parts.length - 1] ?? "";
		}
		ctx.projectName = toValidName(name);
	}

	const { projectName, cwd } = ctx;
	if (!cwd || !projectName) {
		ctx.exit(1);
	}
}

async function checkCwd(cwd: string | undefined) {
	const empty = cwd && isEmpty(cwd);
	if (empty) {
		log("");
		await info("dir", `Using ${cwd} as project directory`);
	}
}
