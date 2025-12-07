import path from "node:path";
import { isCancel, text } from "@clack/prompts";
import type { Context } from "../context";
import { info, title } from "../messages";
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
		ctx.solutionsDir = `solutions`;
		ctx.solutionsPath = path.resolve(ctx.projectName, `./${ctx.solutionsDir}`);
		await info(
			"dir",
			`Solutions directory will be created at ./${ctx.solutionsPath}`,
		);
		return;
	}

	const name = await text({
		message: `${title("dir")}What should we name the solutions directory?`,
		initialValue: `./${ctx.projectName}/solutions`,
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

	ctx.solutionsDir = (name as string)?.trim() ?? "";
	ctx.solutionsPath = path.resolve(projectName, ctx.solutionsDir);
	if (ctx.dryRun) {
		await info("--dry-run", "Skipping solutions directory creation");
		return;
	} else {
		let solutionsPath = ctx.solutionsPath;
		if (solutionsPath?.trim() === "." || solutionsPath?.trim() === "./") {
			const parts = process.cwd().split(path.sep);
			solutionsPath = parts[parts.length - 1] ?? "";
		} else if (
			solutionsPath?.startsWith("./") ||
			solutionsPath?.startsWith("../")
		) {
			const parts = solutionsPath.split("/");
			solutionsPath = parts[parts.length - 1] ?? "";
		}
		ctx.solutionsPath = toValidName(solutionsPath ?? "");
	}

	const { solutionsPath } = ctx;
	if (!solutionsPath) {
		ctx.exit(1);
	}
}
