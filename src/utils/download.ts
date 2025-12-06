import fs from "node:fs";
import path from "node:path";
import { Defuddle } from "defuddle/node";
import { JSDOM } from "jsdom";
import type { Heading, Root, Yaml } from "mdast";
import remarkFrontmatter from "remark-frontmatter";
import remarkNormalizeHeadings from "remark-normalize-headings";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remarkUnlink from "remark-unlink";
import { unified } from "unified";
import { stringify as stringifyYaml } from "yaml";

import { getDayPath } from ".";

async function ensureDirectory(filePath: string): Promise<void> {
	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

async function fetchAoCResource(
	year: string,
	day: string,
	endpoint: string,
): Promise<{ text: string; url: string; dom: JSDOM }> {
	if (!Bun.env.AOC_SESSION) {
		console.error("Error: AOC_SESSION environment variable is not set.\n");
		process.exit(1);
	}
	const url = `https://adventofcode.com/${year}/day/${Number(day)}${endpoint}`;
	const res = await fetch(url, {
		headers: { Cookie: `session=${Bun.env.AOC_SESSION}` },
	});

	const text = await res.text();
	const dom = new JSDOM(text);

	if (!res.ok) {
		throw new Error(
			`Fetching ${endpoint} for ${year}-${day} failed: ${res.status} ${res.statusText}`,
		);
	}

	return { text, url, dom };
}

export async function downloadInput(year: string, day: string): Promise<void> {
	try {
		const downloadPath = path.resolve(getDayPath(year, day), "input.txt");
		console.log(`Downloading input...`);
		const { text } = await fetchAoCResource(year, day, "/input");
		await ensureDirectory(downloadPath);
		await Bun.write(downloadPath, text);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
			throw error;
		}
		throw new Error("Unknown problem occurred while downloading input");
	}
}

export async function downloadPuzzle(year: string, day: string): Promise<void> {
	try {
		console.log(`Downloading puzzle...`);
		const downloadPath = path.resolve(getDayPath(year, day), "puzzle.md");
		const { dom, url } = await fetchAoCResource(year, day, "");
		const { content } = await Defuddle(dom, url, { markdown: true });
		const file = await unified()
			.use(remarkParse)
			.use(remarkStringify)
			.use(remarkUnlink)
			.use(remarkNormalizeHeadings)
			.use(remarkFrontmatter, ["yaml"])
			.use(addFrontmatterPlugin, {
				data: { url, date: `${year}-${day.padStart(2, "0")}` },
			})
			.process(content);

		await ensureDirectory(downloadPath);
		await Bun.write(
			downloadPath,
			String(file).replace(/^(#{1,6}\s+)---\s*(.*?)\s*---\s*$/gm, "$1$2\n"),
		);
	} catch (error) {
		if (error instanceof Error) {
			console.error(error.message);
			throw error;
		}
		throw new Error("Unknown problem occurred while downloading puzzle");
	}
}

function extractTextFromNode(node: unknown): string {
	if (typeof node === "string") {
		return node;
	}
	if (node && typeof node === "object" && "type" in node) {
		if (
			node.type === "text" &&
			"value" in node &&
			typeof node.value === "string"
		) {
			return node.value;
		}
		if ("children" in node && Array.isArray(node.children)) {
			return node.children.map(extractTextFromNode).join("");
		}
	}
	return "";
}

function addFrontmatterPlugin(options: { data: Record<string, unknown> }) {
	return (tree: Root) => {
		const firstHeading = tree.children.find(
			(child): child is Heading => child.type === "heading",
		);

		if (firstHeading) {
			const title = extractTextFromNode(firstHeading).trim();
			if (title) {
				options.data.title = title
					.replace(/^#+\s*/, "")
					.replace(/---/g, "")
					.replace(/Day \d+:/, "")
					.trim();
			}
		}

		const yamlString = stringifyYaml(options.data).trim();

		const newNode: Yaml = {
			type: "yaml",
			value: yamlString,
		};

		if (tree.children.length > 0 && tree.children[0].type === "yaml") {
			tree.children[0] = newNode;
		} else {
			tree.children.unshift(newNode);
		}
	};
}
