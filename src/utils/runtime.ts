import fs from "node:fs/promises";

declare const Bun:
	| {
			write: (path: string, data: string) => Promise<number>;
			file: (path: string) => { text: () => Promise<string> };
	  }
	| undefined;

export const isBun = typeof Bun !== "undefined";

export async function writeFile(path: string, data: string): Promise<void> {
	if (isBun && typeof Bun !== "undefined") {
		await Bun.write(path, data);
	} else {
		await fs.writeFile(path, data);
	}
}

export async function readFile(path: string): Promise<string> {
	if (isBun && typeof Bun !== "undefined") {
		return Bun.file(path).text();
	}
	return fs.readFile(path, "utf-8");
}
