const FESTIVE_MESSAGES = [
	"May your algorithms be merry and bright! 🌟",
	"Rudolph's nose is glowing—you're all set! 🔴",
	"Time to unwrap some puzzles! 🎁",
	"Let the coding festivities begin! 🎄",
	"Your sleigh is fueled and ready! 🛷",
];

export function getRandomFestiveMessage(): string {
	const index = Math.floor(Math.random() * FESTIVE_MESSAGES.length);
	return FESTIVE_MESSAGES[index] ?? FESTIVE_MESSAGES[0] ?? "";
}
