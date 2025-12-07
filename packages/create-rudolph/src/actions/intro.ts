import { getFriendlyName } from "../lib/git";
import { banner } from "../ui/messages";

export async function intro() {
	const name = await getFriendlyName();
	banner(name);
}
