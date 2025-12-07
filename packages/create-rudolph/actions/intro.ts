import { getFriendlyName } from "../git-utils";
import { banner } from "../messages";

export async function intro() {
	const name = await getFriendlyName();
	banner(name);
}
