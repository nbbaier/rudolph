import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

declare const Bun:
	| {
			write: (path: string, data: string) => Promise<number>;
			file: (path: string) => { text: () => Promise<string> };
	  }
	| undefined;

export const isBun = typeof Bun !== "undefined";

export async function writeFile(filePath: string, data: string): Promise<void> {
	if (isBun && typeof Bun !== "undefined") {
		await Bun.write(filePath, data);
	} else {
		await fsPromises.writeFile(filePath, data);
	}
}

export async function readFile(filePath: string): Promise<string> {
	if (isBun && typeof Bun !== "undefined") {
		return Bun.file(filePath).text();
	}
	return fsPromises.readFile(filePath, "utf-8");
}

export async function ensureDirectory(filePath: string): Promise<void> {
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

export function fileExists(filePath: string): boolean {
	return fs.existsSync(filePath);
}
