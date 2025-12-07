import { exec as nodeExec } from "node:child_process";

export const getGitEmail = (): Promise<string | undefined> =>
	new Promise((resolve) => {
		nodeExec(
			"git config user.email",
			{ encoding: "utf-8" },
			(_err, gitEmail) => {
				const email = gitEmail?.trim();
				resolve(email || undefined);
			},
		);
	});

export const getFriendlyName = (): Promise<string> =>
	new Promise((resolve) => {
		nodeExec("git config user.name", { encoding: "utf-8" }, (_1, gitName) => {
			if (gitName?.trim()) {
				return resolve(gitName?.split(" ")[0]?.trim() ?? "");
			}
			nodeExec("whoami", { encoding: "utf-8" }, (_3, whoami) => {
				if (whoami?.trim()) {
					return resolve(whoami?.split(" ")[0]?.trim() ?? "");
				}
				return resolve("friend");
			});
		});
	});
