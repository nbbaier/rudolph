#!/usr/bin/env bun
import { dependencies } from "./actions/dependencies";
import { firstDay } from "./actions/first-day";
import { getEmail } from "./actions/get-email";
import { getSession } from "./actions/get-session";
import { getYear } from "./actions/get-year";
import { git } from "./actions/git";
import { intro } from "./actions/intro";
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
		solutions,
		getYear,
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
	console.log("");

	const labels = {
		start: "Project initializing...",
		end: "Project initialized!",
	};

	console.log({
		projectName: ctx.projectName,
		solutionsDir: ctx.solutionsDir,
		solutionsPath: ctx.solutionsPath,
		aocSession: ctx.aocSession,
		aocUserAgent: ctx.aocUserAgent,
		aocYear: ctx.aocYear,
		git: ctx.git,
		firstDay: ctx.firstDay,
		install: ctx.install,
		yes: ctx.yes,
		tasks: ctx.tasks,
	});
	// await tasks(labels, ctx.tasks);

	// await next(ctx);
}

await main();
