# rudolph: Advent of Code Helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

## Installation

```bash
# With bun (recommended)
bun install -g rudolph

# With npm
npm install -g rudolph

# With pnpm
pnpm add -g rudolph

# With yarn
yarn global add rudolph
```

## Quick Start

The easiest way to get started is to use **[create-rudolph](./packages/create-rudolph)** to scaffold a new workspace:

```bash
bunx create-rudolph my-aoc-workspace
cd my-aoc-workspace
rudolph setup
```

Alternatively, you can manually set up in an existing project:

```bash
# Install rudolph
bun install -g rudolph

# Create .env file
echo "AOC_SESSION=your-session-cookie" > .env

# Set up today's puzzle
rudolph setup
```

## Configuration

Rudolph uses a `.env` file for configuration. It looks for this file in your current directory and parent directories.

```env
AOC_SESSION=your-session-cookie
AOC_YEAR=2024
AOC_USER_AGENT=you@example.com
OUTPUT_DIR=./aoc
```

| Variable | Description | Default |
|----------|-------------|---------|
| `AOC_SESSION` | Your AoC session cookie (required for fetching/submitting) | - |
| `AOC_YEAR` | Default year for commands | Current year (or previous if < Dec) |
| `AOC_USER_AGENT` | Email for User-Agent header (polite for AoC) | - |
| `OUTPUT_DIR` | Directory where solutions are generated | `./aoc` |

### Getting Your Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser dev tools → Application (or Storage) → Cookies
3. Copy the value of the `session` cookie

## Commands

### Setup & Fetching

Initialize a new day or fetch specific data.

- **`rudolph setup`**: Create solution files, download input, and fetch puzzle.
  - `-y, --year <year>`: Year (default: `AOC_YEAR` or current)
  - `-d, --day <day>`: Day (default: today)
  - `-f, --force`: Overwrite existing files
  - `-o, --output-dir <dir>`: Custom output directory

- **`rudolph input`**: Download puzzle input (`input.txt`).
  - `-y, --year <year>`
  - `-d, --day <day>`
  - `-f, --force`: Re-download even if exists

- **`rudolph puzzle`**: Download puzzle description (`puzzle.md`).
  - `-y, --year <year>`
  - `-d, --day <day>`
  - `-f, --force`
  - `--no-print`: Don't print to console

- **`rudolph refresh`**: Re-fetch puzzle (useful for getting Part 2 description).
  - `-y, --year <year>`
  - `-d, --day <day>`
  - `-f, --force`: Force refresh even if Part 1 isn't complete locally

### Running Solutions

- **`rudolph run <target>`**: Run your solution with timing.
  - `<target>`: `sample` or `input`
  - `-y, --year <year>`
  - `-d, --day <day>`
  - `-p, --part <part>`: `1`, `2`, or `both` (default: `both`)

### Submitting & Tracking

- **`rudolph answer <year> <day> <part>`**: Run solution and submit answer to AoC.
  - `<year>`: Year (e.g., 2024)
  - `<day>`: Day number
  - `<part>`: `1` or `2`
  - `--no-refresh`: Skip auto-refreshing puzzle after correct Part 1

- **`rudolph guesses`**: Show guess history for a specific day.
  - `-y, --year <year>`
  - `-d, --day <day>`
  - `--json`: Output as JSON

- **`rudolph stars`**: Show collected stars for a year.
  - `-y, --year <year>`
  - `--json`: Output as JSON

## Solution Format

Generated `index.ts` files follow this structure:

```typescript
// input is the raw content of input.txt or sample.txt
export default {
  p1: (input: string) => {
    // Solve Part 1
    return 0; // Return number or string
  },
  p2: (input: string) => {
    // Solve Part 2
    return 0;
  },
};
```

## Generated File Structure

```
aoc/
└── 2024/
    └── day01/
        ├── index.ts      # Solution file
        ├── puzzle.md     # Puzzle description
        ├── input.txt     # Your puzzle input
        ├── sample.txt    # Sample input (fill this in)
        └── guesses.ndjson # Guess history
```

## Development

This repository is a monorepo managed with Bun.

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run linting
bun run lint
```

## License

MIT
