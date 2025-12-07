import dns from "node:dns/promises";
import type { Context } from "../context";
import { bannerAbort, error, log } from "../messages";

export async function verify(
	ctx: Pick<Context, "version" | "dryRun" | "template" | "ref" | "exit">,
) {
	if (!ctx.dryRun) {
		const online = await isOnline();
		if (!online) {
			bannerAbort();
			log("");
			error("error", `Unable to connect to the internet.`);
			ctx.exit(1);
		}
	}
}

function isOnline(): Promise<boolean> {
	return dns.lookup("github.com").then(
		() => true,
		() => false,
	);
}
