import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";

declare const Bun: unknown;

export const isBun = typeof Bun !== "undefined";

export async function writeFile(filePath: string, data: string): Promise<void> {
	await fsPromises.writeFile(filePath, data);
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
