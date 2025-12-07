# rudolph: an Advent of Code helper

<div align="center">
  <img src="./banner.png" alt="Description">
</div>

Advent of Code CLI - scaffold, run, and manage AoC solutions.

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

# Scaffold today's puzzle
rudolph scaffold

# Scaffold a specific day
rudolph scaffold -d 1 -y 2024
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

### `rudolph scaffold`

Set up a new day - creates solution files, downloads input and puzzle description.

```bash
rudolph scaffold [options]

Options:
  -d, --day <day>         Day number (1-25), defaults to today
  -y, --year <year>       Year, defaults to current year (or previous year before December)
  -f, --force             Force re-scaffold even if files exist
  -o, --output-dir <dir>  Override output directory
```

### `rudolph try` (alias: `sample`)

Run your solution against `sample.txt`.

```bash
rudolph try [options]

Options:
  -d, --day <day>         Day number (1-25)
  -y, --year <year>       Year
  -p, --part <part>       Which part to run (1, 2, or both). Default: both
  -o, --output-dir <dir>  Override output directory
```

### `rudolph attempt` (alias: `run`)

Run your solution against `input.txt` with timing.

```bash
rudolph attempt [options]

Options:
  -d, --day <day>         Day number (1-25)
  -y, --year <year>       Year
  -p, --part <part>       Which part to run (1, 2, or both). Default: both
  -o, --output-dir <dir>  Override output directory
```

### `rudolph read`

Download puzzle description to `puzzle.md`.

```bash
rudolph read [options]

Options:
  -d, --day <day>         Day number (1-25)
  -y, --year <year>       Year
  -f, --force             Force re-download
  -o, --output-dir <dir>  Override output directory
```

### `rudolph refresh`

Re-download puzzle (useful after solving part 1 to get part 2).

```bash
rudolph refresh [options]

Options:
  -d, --day <day>         Day number (1-25)
  -y, --year <year>       Year
  -o, --output-dir <dir>  Override output directory
```

## Generated File Structure

```
aoc/
└── 2024/
    └── day01/
        ├── index.ts      # Solution file
        ├── day01.test.ts # Test file
        ├── puzzle.md     # Puzzle description
        ├── input.txt     # Your puzzle input
        └── sample.txt    # Sample input (fill this in)
```

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
