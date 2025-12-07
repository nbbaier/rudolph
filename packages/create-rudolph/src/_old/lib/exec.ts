import { spawn } from "node:child_process";

interface ExecOptions {
	cwd?: string;
	timeout?: number;
}

export function exec(
	command: string,
	args: string[],
	opts: ExecOptions = {},
): Promise<string> {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: opts.cwd,
			stdio: ["ignore", "pipe", "pipe"],
			timeout: opts.timeout,
		});

		let stdout = "";
		let stderr = "";

		child.stdout?.on("data", (data) => {
			stdout += data.toString();
		});
		child.stderr?.on("data", (data) => {
			stderr += data.toString();
		});

		child.on("error", reject);
		child.on("close", (code) => {
			if (code === 0) {
				resolve(stdout.trim());
			} else {
				reject(new Error(stderr.trim() || `Command failed with code ${code}`));
			}
		});
	});
}
