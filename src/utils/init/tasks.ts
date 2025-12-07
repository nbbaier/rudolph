import type { Task } from "./context";
import { info, log } from "./ui";

export async function runTasks(
	tasks: Task[],
	{ dryRun }: { dryRun?: boolean },
): Promise<void> {
	if (!tasks.length) return;

	if (dryRun) {
		log(`\nSkipping ${tasks.length} task(s) due to --dry-run.`);
		return;
	}

	for (const task of tasks) {
		if (task.start) await info("", task.start);
		try {
			if (task.while) {
				await task.while();
			}
			if (task.end) await info("", task.end);
		} catch (err) {
			if (task.onError) {
				task.onError(err);
			} else {
				throw err;
			}
		}
	}
}
