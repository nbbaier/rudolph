import { afterEach, beforeEach, describe, expect, spyOn, test } from "bun:test";
import {
	DownloadError,
	InvalidSessionError,
	MissingSessionError,
} from "../errors";
import { fetchYearStars, parseCalendarHtml } from "./stars";

function makeCalendarHtml(
	body: string,
	options: { authenticated?: boolean } = {},
): string {
	const authenticated = options.authenticated ?? true;
	const header = authenticated
		? `<header><div><h1 class="title-global"><a href="/">Advent of Code</a></h1><nav><ul><li><a href="/2024/about">[About]</a></li></ul></nav><div class="user">tester <span class="star-count">3*</span></div></div></header>`
		: `<header><div><h1 class="title-global"><a href="/">Advent of Code</a></h1><nav><ul><li><a href="/2024/auth/login">[Log In]</a></li></ul></nav></div></header>`;

	return `<!DOCTYPE html><html><body>${header}<main><pre class="calendar">${body}</pre></main></body></html>`;
}

describe("parseCalendarHtml", () => {
	test("parses 0, 1, and 2 star days and sorts ascending", () => {
		const html = makeCalendarHtml(`
<a aria-label="Day 10" href="/2024/day/10" class="calendar-day10">...</a>
<a aria-label="Day 1, two stars" href="/2024/day/1" class="calendar-day1 calendar-verycomplete">...</a>
<a aria-label="Day 2, one star" href="/2024/day/2" class="calendar-day2 calendar-complete">...</a>
<span aria-label="Day 11" class="calendar-day11">locked</span>
		`);

		const result = parseCalendarHtml(html, "2024");

		expect(result).toEqual({
			year: "2024",
			days: [
				{ day: "01", stars: 2, display: "★★" },
				{ day: "02", stars: 1, display: "★☆" },
				{ day: "10", stars: 0, display: "☆☆" },
			],
			total: 3,
			maxStars: 6,
		});
	});

	test("falls back to aria-label and href when calendar classes are missing", () => {
		const html = makeCalendarHtml(`
<a aria-label="Day 3, two stars" href="/2025/day/3">...</a>
<a aria-label="Day 4, one star" href="/2025/day/4">...</a>
		`);

		const result = parseCalendarHtml(html, "2025");

		expect(result).toEqual({
			year: "2025",
			days: [
				{ day: "03", stars: 2, display: "★★" },
				{ day: "04", stars: 1, display: "★☆" },
			],
			total: 3,
			maxStars: 4,
		});
	});

	test("handles empty calendar before puzzles unlock", () => {
		const html = makeCalendarHtml(
			`<span aria-label="Day 1" class="calendar-day1">locked</span>`,
		);

		const result = parseCalendarHtml(html, "2026");

		expect(result).toEqual({
			year: "2026",
			days: [],
			total: 0,
			maxStars: 0,
		});
	});

	test("throws InvalidSessionError when page is unauthenticated", () => {
		const html = makeCalendarHtml(
			`<a aria-label="Day 1" href="/2024/day/1" class="calendar-day1">...</a>`,
			{ authenticated: false },
		);

		expect(() => parseCalendarHtml(html, "2024")).toThrow(InvalidSessionError);
	});
});

describe("fetchYearStars", () => {
	const originalSession = process.env.AOC_SESSION;
	let fetchSpy: ReturnType<typeof spyOn> | undefined;

	beforeEach(() => {
		delete process.env.AOC_SESSION;
	});

	afterEach(() => {
		fetchSpy?.mockRestore();
		fetchSpy = undefined;
		if (originalSession === undefined) {
			delete process.env.AOC_SESSION;
		} else {
			process.env.AOC_SESSION = originalSession;
		}
	});

	test("throws MissingSessionError when AOC_SESSION is missing", async () => {
		await expect(fetchYearStars("2024")).rejects.toThrow(MissingSessionError);
	});

	test("fetches calendar with AoC headers and returns parsed stars", async () => {
		process.env.AOC_SESSION = "test-session-token";
		const html = makeCalendarHtml(
			`<a aria-label="Day 1, two stars" href="/2024/day/1" class="calendar-day1 calendar-verycomplete">...</a>`,
		);

		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(html, { status: 200 }),
		);

		const result = await fetchYearStars("2024");

		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
		expect(url).toBe("https://adventofcode.com/2024");
		expect((init.headers as Record<string, string>).Cookie).toBe(
			"session=test-session-token",
		);
		expect((init.headers as Record<string, string>)["User-Agent"]).toContain(
			"rudolph/",
		);
		expect(result).toEqual({
			year: "2024",
			days: [{ day: "01", stars: 2, display: "★★" }],
			total: 2,
			maxStars: 2,
		});
	});

	test("throws DownloadError on 404 response", async () => {
		process.env.AOC_SESSION = "test-session-token";
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("Not Found", { status: 404, statusText: "Not Found" }),
		);

		await expect(fetchYearStars("1999")).rejects.toThrow(DownloadError);
	});

	test("throws InvalidSessionError when AoC returns logged-out HTML", async () => {
		process.env.AOC_SESSION = "expired-session";
		const html = makeCalendarHtml("", { authenticated: false });
		fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(html, { status: 200 }),
		);

		await expect(fetchYearStars("2024")).rejects.toThrow(InvalidSessionError);
	});
});
