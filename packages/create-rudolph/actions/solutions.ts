import path from "node:path";
import { isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { info } from "../messages";
import { isEmpty, toValidName } from "../shared";

export async function solutions(
	ctx: Pick<
		Context,
		| "tasks"
		| "yes"
		| "exit"
		| "solutionsPath"
		| "solutionsDir"
		| "dryRun"
		| "projectName"
	>,
) {
	if (ctx.yes && ctx.projectName) {
		ctx.solutionsDir = "solutions";
		ctx.solutionsPath = path.resolve(ctx.projectName, ctx.solutionsDir);
		await info("dir", `Solutions will live in ./${ctx.projectName}/${ctx.solutionsDir}`);
		return;
	}

	const name = await text({
		message: "Folder for your daily solutions (inside the project):",
		placeholder: "solutions",
		initialValue: "solutions",
		validate(value: string) {
			if (!isEmpty(value)) {
				return `Directory is not empty!`;
			}
			if (value.match(/[^\x20-\x7E]/g) !== null)
				return `Invalid non-printable character present!`;
		},
	});

	if (isCancel(name)) {
		ctx.exit(1);
	}

	const { projectName } = ctx;
	if (!projectName) {
		ctx.exit(1);
	}

	ctx.solutionsDir = (name as string)?.trim() ?? "solutions";
	ctx.solutionsPath = path.resolve(projectName, ctx.solutionsDir);

	if (ctx.dryRun) {
		await info("--dry-run", "Skipping solutions directory creation");
		return;
	}
}
