# rudolph: an Advent of Code helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

Advent of Code CLI - set up, run, submit, and track AoC solutions.

## Installation

```bash
# With bun (recommended for best performance)
bun install -g rudolph

# With npm
npm install -g rudolph

# With pnpm
pnpm add -g rudolph

# With yarn
yarn global add rudolph
```

### Runtime Requirements

-  **Bun**: Full support out of the box (recommended)
-  **Node.js 18+**: Requires `tsx` for running TypeScript solutions. Install it globally or in your project:
   ```bash
   npm install -g tsx
   ```

## Quick Start

```bash
# Create a .env file with your session cookie
echo "AOC_SESSION=your-session-cookie" > .env

# Set up today's puzzle (creates files, fetches input+puzzle)
rudolph setup

# Set up a specific day (year day)
rudolph setup 2024 1

# Full interactive setup
rudolph init
```

## Configuration

Create a `.env` file in your project root:

```
AOC_SESSION=your-session-cookie
OUTPUT_DIR=./aoc
AOC_YEAR=2024
```

| Variable      | Description                                        | Default                                    |
| ------------- | -------------------------------------------------- | ------------------------------------------ |
| `AOC_SESSION` | Your AoC session cookie (required for downloading) | -                                          |
| `OUTPUT_DIR`  | Where to scaffold puzzle files                     | `./aoc`                                    |
| `AOC_YEAR`    | Default year for puzzles                           | Current year (or previous year before Dec) |

To get your session cookie:

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser dev tools → Application → Cookies
3. Copy the `session` cookie value

## Commands

**Core (fetch / submit / track)**

-  `rudolph input`: download puzzle input to `input.txt` (cached). Options: `-d/--day`, `-y/--year`, `-o/--output-dir`, `-f/--force`.
-  `rudolph puzzle`: download puzzle text to `puzzle.md` (uses cache if present) and print to stdout by default. Options: `-d/--day`, `-y/--year`, `-o/--output-dir`, `-f/--force`, `--no-print`.
-  `rudolph refresh`: re-download puzzle; blocks unless part 1 is recorded complete; `--force` overrides. Options: `-d/--day`, `-y/--year`, `-o/--output-dir`, `-f/--force`.
-  `rudolph answer`: run solution against `input.txt`, submit to AoC with guardrails (duplicate/high/low/locked/cooldown), and log guesses (cache + project). Positional args: `<year> <day> <part>`; Options: `-o/--output-dir`, `--no-refresh`.
-  `rudolph stars`: show stars per day for a year from guess history. Options: `-y/--year` (defaults to current or previous before Dec), `-o/--output-dir`, `--json`.
-  `rudolph guesses`: display guess history for a day. Options: `-d/--day`, `-y/--year`, `-o/--output-dir`, `--json`.

**Ergonomics (setup / run / init)**

-  `rudolph init`: interactive bootstrap (.env, output dir/year, session, optional git init, optional install, setup today).
-  `rudolph setup`: create day folder, runner/test templates, sample stub; fetch input + puzzle. Options: `-d/--day`, `-y/--year`, `-o/--output-dir`, `-f/--force` (warns it overwrites).
-  `rudolph run sample|input`: run solution against `sample.txt` or `input.txt` with timing. Options: `-d/--day`, `-y/--year`, `-p/--part (default both)`, `-o/--output-dir`.

## Generated File Structure

```
aoc/
└── 2024/
    └── day01/
        ├── index.ts      # Solution file
        ├── day01.test.ts # Test file
        ├── puzzle.md     # Puzzle description
        ├── input.txt     # Your puzzle input
        ├── sample.txt    # Sample input (fill this in)
        └── guesses.ndjson # Guess history (synced with cache)
```

Cache layout mirrors guesses in the project: `~/.cache/rudolph/<year>/dayXX/`.

## Solution Format

Your `index.ts` should export a default object with `p1` and `p2` functions:

```typescript
function part1(input: string): number | string {
   return 0;
}

function part2(input: string): number | string {
   return 0;
}

export default { p1: part1, p2: part2 };
```

## License

MIT
