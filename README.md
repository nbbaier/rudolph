# rudolph: Advent of Code Helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

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
-  **Node.js 18+**: Requires `tsx` for running TypeScript solutions. Install globally or in your project:
   ```bash
   npm install -g tsx
   ```

## Quick Start

```bash
# Initialize a new AoC workspace (interactive setup)
rudolph init

# Or manually set up today's puzzle
echo "AOC_SESSION=your-session-cookie" > .env
rudolph setup

# Set up a specific day
rudolph setup 2024 1
```

## Configuration

Create a `.env` file in your project root:

```
AOC_SESSION=your-session-cookie
OUTPUT_DIR=./aoc
AOC_YEAR=2024
```

| Variable         | Description                                        | Default                                    |
| ---------------- | -------------------------------------------------- | ------------------------------------------ |
| `AOC_SESSION`    | Your AoC session cookie (required for downloading) | -                                          |
| `AOC_USER_AGENT` | Your email for AoC User-Agent (recommended)        | -                                          |
| `OUTPUT_DIR`     | Where to scaffold puzzle files                     | `./aoc`                                    |
| `AOC_YEAR`       | Default year for puzzles                           | Current year (or previous year before Dec) |

To get your session cookie:

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser dev tools → Application → Cookies
3. Copy the `session` cookie value

### User-Agent (Recommended)

Eric Wastl (AoC creator) requests that automated tools include contact info so he can reach you if traffic is problematic. Set your email in `AOC_USER_AGENT`:

```bash
export AOC_USER_AGENT="you@example.com"
```

This sends requests with: `rudolph/1.0.0 (you@example.com)`. If not set, requests use: `rudolph/1.0.0 (+https://github.com/nbbaier/rudolph)`.

## Commands

### Setup & Initialization

-  `rudolph init` - Interactive bootstrap for a new AoC workspace (creates `.env`, output directory, fetches session)
-  `rudolph setup [year] [day]` - Create day folder, generate solution templates, fetch input and puzzle. Options: `-f/--force` (warns if overwriting)

### Fetch Data

-  `rudolph input [year] [day]` - Download puzzle input to `input.txt` (cached). Options: `-f/--force`
-  `rudolph puzzle [year] [day]` - Download puzzle description to `puzzle.md` and print to stdout. Options: `-f/--force`, `--no-print`
-  `rudolph refresh [year] [day]` - Re-download puzzle for part 2 (blocks unless part 1 is recorded complete). Options: `-f/--force`

### Run Solutions

-  `rudolph run <target> [options]` - Run solution against `sample` or `input` with timing. Options: `-d/--day`, `-y/--year`, `-p/--part` (1, 2, or both)

### Submit & Track

-  `rudolph answer <year> <day> <part>` - Run solution, submit to AoC with guardrails (duplicate/too-high/too-low/locked/cooldown), and log guesses. Options: `--no-refresh` to skip auto-refresh after correct part 1
-  `rudolph guesses [year] [day]` - Display guess history for a day. Options: `--json`
-  `rudolph stars [options]` - Show stars for a year using recorded guesses. Options: `-y/--year`, `--json`

## Generated File Structure

```
aoc/
└── 2024/
    └── day01/
        ├── index.ts      # Solution file
        ├── puzzle.md     # Puzzle description
        ├── input.txt     # Your puzzle input
        ├── sample.txt    # Sample input (fill this in)
        └── guesses.ndjson # Guess history (synced with cache)
```

Guess history is cached locally at `~/.cache/rudolph/<year>/dayXX/` and synced with the project folder.

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

## Development

```bash
# Build the project
npm run build

# Run in dev mode
npm run dev

# Lint and format
npm run lint:fix
npm run format:fix

# Type check
npm run typecheck
```

## License

MIT
