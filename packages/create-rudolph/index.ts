#!/usr/bin/env bun
import { dependencies } from "./actions/dependencies";
import { firstDay } from "./actions/first-day";
import { getEmail } from "./actions/get-email";
import { getSession } from "./actions/get-session";
import { getYear } from "./actions/get-year";
import { git } from "./actions/git";
import { intro } from "./actions/intro";
import { next } from "./actions/next-steps";
import { projectName } from "./actions/project-name";
import { scaffold } from "./actions/scaffold";
import { solutions } from "./actions/solutions";
import { verify } from "./actions/verify";
import { getContext } from "./context";

export async function main() {
	console.log("");

	const cleanArgv = process.argv.slice(2).filter((arg) => arg !== "--");
	const ctx = await getContext(cleanArgv);

	const steps = [
		verify,
		intro,
		projectName,
		getYear,
		solutions,
		getSession,
		getEmail,
		scaffold,
		dependencies,
		firstDay,
		git,
	];

	for (const step of steps) {
		await step(ctx);
	}

	// TODO: Execute tasks here (e.g., scaffold, install deps, init git)
	// await tasks(ctx.tasks);

	await next(ctx);
}

await main();
