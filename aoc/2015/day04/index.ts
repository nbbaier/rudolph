import crypto from "node:crypto";

function part1(input: string): number | string {
	let n = 1;
	while (true) {
		const hash = crypto.createHash("md5").update(`${input}${n}`).digest("hex");
		if (hash.startsWith("00000")) {
			return n;
		}
		n++;
	}
}

function part2(input: string): number | string {
	let n = 1;
	while (true) {
		const hash = crypto.createHash("md5").update(`${input}${n}`).digest("hex");
		if (hash.startsWith("000000")) {
			return n;
		}
		n++;
	}
}

export default { p1: part1, p2: part2 };
