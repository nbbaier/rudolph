import fs from "node:fs";
import path from "node:path";
import { getOutputDir } from "../env";
import { writeFile } from "./runtime";

const RUNNER_TEMPLATE = `function part1(_input: string): number | string {
	return 0;
}

function part2(_input: string): number | string {
	return 0;
}

export default { p1: part1, p2: part2 };
`;

export function loadFile(filePath: string) {
	return fs.readFileSync(filePath).toString();
}

export function getDayPath(
	year: string,
	day: string,
	outputDir?: string,
): string {
	const dir = outputDir ?? getOutputDir();
	return path.join(dir, year, `day${day.padStart(2, "0")}`);
}

export async function createRunnerFile(targetPath: string): Promise<void> {
	await writeFile(targetPath, RUNNER_TEMPLATE);
}
