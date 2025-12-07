import path from "node:path";
import type { Context } from "../context";
import { nextSteps } from "../messages";

export async function next(
	ctx: Pick<Context, "hat" | "tie" | "cwd" | "packageManager">,
) {
	const projectDir = path.relative(process.cwd(), ctx.cwd);

	const commandMap: { [key: string]: string } = {
		npm: "npm run dev",
		bun: "bun run dev",
		yarn: "yarn dev",
		pnpm: "pnpm dev",
	};

	const devCmd =
		commandMap[ctx.packageManager as keyof typeof commandMap] || "npm run dev";
	await nextSteps({ projectDir, devCmd });

	return;
}
