import fs from "node:fs";
import path from "node:path";
import { scaffoldProject } from "./actions/scaffold";

async function main() {
	const target = path.resolve("advent-of-code");

	if (fs.existsSync(target)) {
		console.log("[debug-scaffold] removing existing", target);
		fs.rmSync(target, { recursive: true, force: true });
	}

	process.env.DEBUG_SCAFFOLD = "1";

	await scaffoldProject({
		projectName: "advent-of-code",
		cwd: target,
		packageManager: "bun",
		aocSession: "FILL_ME_IN",
		aocYear: String(new Date().getFullYear()),
		aocUserAgent: "FILL_ME_IN",
		solutionsDir: "solutions",
	});

	console.log("[debug-scaffold] done");
}

await main();
