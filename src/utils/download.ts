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
import { getSession } from "../env";
import {
	DownloadError,
	InvalidSessionError,
	MissingSessionError,
} from "../errors";
import { getDayPath } from ".";
import { ensureDirectory, writeFile } from "./runtime";

async function fetchAoCResource(
	year: string,
	day: string,
	endpoint: string,
): Promise<{ text: string; url: string; dom: JSDOM }> {
	const session = getSession();
	if (!session) {
		throw new MissingSessionError();
	}

	const url = `https://adventofcode.com/${year}/day/${Number(day)}${endpoint}`;
	const res = await fetch(url, {
		headers: { Cookie: `session=${session}` },
	});

	const text = await res.text();
	const dom = new JSDOM(text);

	if (!res.ok) {
		if (res.status === 400 || res.status === 500) {
			const bodyText = text.toLowerCase();
			if (
				bodyText.includes("log in") ||
				bodyText.includes("please log in") ||
				bodyText.includes("puzzle inputs differ")
			) {
				throw new InvalidSessionError();
			}
		}
		throw new DownloadError(
			`Fetching ${endpoint || "puzzle"} for ${year} day ${day} failed: ${res.status} ${res.statusText}`,
			res.status,
		);
	}

	return { text, url, dom };
}

export async function downloadInput(
	year: string,
	day: string,
	outputDir?: string,
): Promise<void> {
	const downloadPath = path.resolve(
		getDayPath(year, day, outputDir),
		"input.txt",
	);
	console.log("Downloading input...");
	const { text } = await fetchAoCResource(year, day, "/input");
	await ensureDirectory(downloadPath);
	await writeFile(downloadPath, text);
}

export async function downloadPuzzle(
	year: string,
	day: string,
	outputDir?: string,
): Promise<void> {
	console.log("Downloading puzzle...");
	const downloadPath = path.resolve(
		getDayPath(year, day, outputDir),
		"puzzle.md",
	);
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
	await writeFile(
		downloadPath,
		String(file).replace(/^(#{1,6}\s+)---\s*(.*?)\s*---\s*$/gm, "$1$2\n"),
	);
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
