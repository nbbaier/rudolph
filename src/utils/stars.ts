import { JSDOM } from "jsdom";
import { getAoCHeaders, getSession } from "../env";
import {
	DownloadError,
	InvalidSessionError,
	MissingSessionError,
} from "../errors";

export type StarDisplay = "☆☆" | "★☆" | "★★";

export interface DayStars {
	day: string;
	stars: 0 | 1 | 2;
	display: StarDisplay;
}

export interface YearStarsSummary {
	year: string;
	days: DayStars[];
	total: number;
	maxStars: number;
}

function formatStarDisplay(stars: 0 | 1 | 2): StarDisplay {
	if (stars === 2) return "★★";
	if (stars === 1) return "★☆";
	return "☆☆";
}

function parseStarCount(el: Element): 0 | 1 | 2 {
	if (el.classList.contains("calendar-verycomplete")) {
		return 2;
	}
	if (el.classList.contains("calendar-complete")) {
		return 1;
	}
	const ariaLabel = el.getAttribute("aria-label")?.toLowerCase() ?? "";
	if (ariaLabel.includes("two stars")) {
		return 2;
	}
	if (ariaLabel.includes("one star")) {
		return 1;
	}
	return 0;
}

function parseDayNumber(el: Element): number | null {
	for (const cls of el.classList) {
		const match = /^calendar-day(\d+)$/.exec(cls);
		if (match) {
			return Number(match[1]);
		}
	}
	const href = el.getAttribute("href");
	if (href) {
		const match = /\/day\/(\d+)$/.exec(href);
		if (match) {
			return Number(match[1]);
		}
	}
	return null;
}

export function parseCalendarHtml(
	html: string,
	year: string,
): YearStarsSummary {
	const dom = new JSDOM(html);
	const { document } = dom.window;

	const userEl = document.querySelector("header .user");
	const loginLink = document.querySelector('header a[href*="/auth/login"]');
	if (!userEl || loginLink) {
		throw new InvalidSessionError();
	}

	const dayLinks = document.querySelectorAll("pre.calendar a");
	const dayMap = new Map<number, DayStars>();

	for (const el of dayLinks) {
		const dayNum = parseDayNumber(el);
		if (dayNum === null) continue;
		const stars = parseStarCount(el);
		dayMap.set(dayNum, {
			day: String(dayNum).padStart(2, "0"),
			stars,
			display: formatStarDisplay(stars),
		});
	}

	const days = Array.from(dayMap.entries())
		.sort(([a], [b]) => a - b)
		.map(([, entry]) => entry);

	const total = days.reduce((sum, entry) => sum + entry.stars, 0);
	const maxStars = days.length * 2;

	return { year, days, total, maxStars };
}

export async function fetchYearStars(year: string): Promise<YearStarsSummary> {
	const session = getSession();
	if (!session) {
		throw new MissingSessionError();
	}

	const url = `https://adventofcode.com/${year}`;
	const res = await fetch(url, {
		headers: getAoCHeaders(),
	});

	if (!res.ok) {
		if (res.status === 404) {
			throw new DownloadError(
				`Year ${year} not found on Advent of Code.`,
				res.status,
			);
		}
		throw new DownloadError(
			`Fetching stars for ${year} failed: ${res.status} ${res.statusText}`,
			res.status,
		);
	}

	const html = await res.text();
	return parseCalendarHtml(html, year);
}
