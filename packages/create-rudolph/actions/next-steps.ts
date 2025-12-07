import path from "node:path";
import type { Context } from "../context";
import { nextSteps } from "../messages";

export async function next(
	ctx: Pick<Context, "cwd" | "projectName" | "packageManager">,
) {
	const projectDir = ctx.projectName || path.relative(process.cwd(), ctx.cwd);

	const commandMap: { [key: string]: string } = {
		npm: "npm run",
		bun: "bun run",
		yarn: "yarn",
		pnpm: "pnpm",
	};

	const pmPrefix = commandMap[ctx.packageManager] || "npm run";
	await nextSteps({ projectDir, pmPrefix });
}
