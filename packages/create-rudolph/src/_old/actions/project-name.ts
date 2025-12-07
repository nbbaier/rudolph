import path from "node:path";
import { isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { isEmpty, toValidName } from "../lib/validation";
import { color } from "../ui/colors";
import { info } from "../ui/messages";

export async function projectName(
	ctx: Pick<
		Context,
		| "yes"
		| "dryRun"
		| "projectName"
		| "projectNameExplicitlyProvided"
		| "exit"
		| "tasks"
		| "cwd"
	>,
) {
	// If a target directory was explicitly provided, use it (regardless of empty status)
	if (ctx.projectNameExplicitlyProvided && ctx.projectName) {
		if (!isEmpty(ctx.cwd)) {
			await info(
				"Hmm...",
				`${color.reset(`"${ctx.cwd}"`)}${color.dim(` is not empty!`)}`,
			);
		}

		let name = ctx.projectName;
		if (name?.trim() === "." || name?.trim() === "./") {
			const parts = process.cwd().split(path.sep);
			name = parts[parts.length - 1] ?? "";
		} else if (name?.startsWith("./") || name?.startsWith("../")) {
			const parts = name.split("/");
			name = parts[parts.length - 1] ?? "";
		}
		ctx.projectName = toValidName(name);

		if (isEmpty(ctx.cwd)) {
			await info("dir", `Using ${ctx.cwd} as project directory`);
		}
		return;
	}

	// No target directory provided, ask user
	if (ctx.yes) {
		ctx.projectName = "advent-of-code";
		ctx.cwd = path.resolve(process.cwd(), ctx.projectName);
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
	ctx.cwd = path.resolve(process.cwd(), trimmedName);
	ctx.projectName = toValidName(trimmedName);
	if (ctx.dryRun) {
		await info("--dry-run", "Skipping project naming");
		return;
	}

	const { projectName, cwd } = ctx;
	if (!cwd || !projectName) {
		ctx.exit(1);
	}
}

