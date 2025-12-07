import type { Context } from "node:vm";
import { banner } from "../messages";

export async function intro(_ctx: Pick<Context, "help">) {
	banner();
}
