import { exec } from "node:child_process";

/**
 * Get the user's git name from git config
 */
export const getGitName = () =>
	new Promise<string | undefined>((resolve) => {
		exec("git config user.name", { encoding: "utf-8" }, (_err, gitName) => {
			const name = gitName?.trim();
			resolve(name || undefined);
		});
	});

/**
 * Get the user's git email from git config
 */
export const getGitEmail = () =>
	new Promise<string | undefined>((resolve) => {
		exec("git config user.email", { encoding: "utf-8" }, (_err, gitEmail) => {
			const email = gitEmail?.trim();
			resolve(email || undefined);
		});
	});

/**
 * Get a friendly name from git config or system username
 */
export const getFriendlyName = () =>
	new Promise<string>((resolve) => {
		exec("git config user.name", { encoding: "utf-8" }, (_1, gitName) => {
			if (gitName?.trim()) {
				// Get first name only
				return resolve(gitName?.split(" ")[0]?.trim() ?? "");
			}
			exec("whoami", { encoding: "utf-8" }, (_3, whoami) => {
				if (whoami?.trim()) {
					return resolve(whoami?.split(" ")[0]?.trim() ?? "");
				}
				return resolve("friend");
			});
		});
	});
