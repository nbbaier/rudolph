# rudolph

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

> **Note**: This is an early release. Use the `@next` tag to install the latest pre-release version.

## Installation

```bash
# With bun (recommended)
bun install -g @nbbaier/rudolph@next

# With npm
npm install -g @nbbaier/rudolph@next

# With pnpm
pnpm add -g @nbbaier/rudolph@next

# With yarn
yarn global add @nbbaier/rudolph@next
```

## Quick Start

```bash
# Create .env file with your session cookie
echo "AOC_SESSION=your-session-cookie" > .env

# Set up today's puzzle (Downloads input/puzzle and scaffolds aoc/<year>/dayXX files)
rudolph setup

# Run solution against sample input
rudolph run sample

# Submit answer for Part 1
rudolph answer 2024 1 1
```

For a guided setup experience, use **[create-rudolph](../create-rudolph)** instead:

```bash
bunx @nbbaier/create-rudolph@next advent-of-code
cd advent-of-code
rudolph setup
```

## Configuration

Rudolph uses a `.env` file for configuration. It searches the current directory and parent directories, so commands work from subfolders if an upstream `.env` exists.

```env
AOC_SESSION=your-session-cookie
AOC_YEAR=2024
AOC_USER_AGENT=you@example.com
OUTPUT_DIR=./aoc
```

| Variable         | Description                                                | Default                             |
| ---------------- | ---------------------------------------------------------- | ----------------------------------- |
| `AOC_SESSION`    | Your AoC session cookie (required for fetching/submitting) | —                                   |
| `AOC_YEAR`       | Default year for commands                                  | Current year (or previous if < Dec) |
| `AOC_USER_AGENT` | Email for User-Agent header (polite for AoC)               | —                                   |
| `OUTPUT_DIR`     | Directory where solutions are generated                    | `./aoc`                             |

### Getting Your Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser dev tools → Application (or Storage) → Cookies
3. Copy the value of the `session` cookie

## Examples

### Basic workflow

```bash
# Set up today's puzzle
rudolph setup

# Test with sample input
rudolph run sample

# Run with real input
rudolph run input

# Submit your answer
rudolph answer 2024 1 1
```

### Working with specific days

```bash
# Set up a specific day
rudolph setup 2024 5

# Run a specific day's solution
rudolph run input 2024 5

# Run only part 1
rudolph run input 2024 5 1
```

### Performance Tips

-  Use `rudolph run sample` first to test your solution before running against the full input
-  For large inputs, consider streaming processing to avoid memory issues
-  Use the `--json` flag for machine-readable output when scripting

## Advanced Configuration

### Multiple Environments

```env
# .env.production
AOC_SESSION=prod-session-cookie
AOC_YEAR=2024
OUTPUT_DIR=./aoc-prod

# .env.development
AOC_SESSION=dev-session-cookie
AOC_YEAR=2023
OUTPUT_DIR=./aoc-dev
```

### Custom User Agent

```env
AOC_USER_AGENT=my-aoc-bot@example.com
```

## Error Handling

### Common Errors

**Invalid Session Cookie**: If you see "403 Forbidden" errors, your session cookie may be invalid. Double-check it matches your browser's cookie.

**Rate Limiting**: Advent of Code may rate limit requests. Wait a few minutes and try again.

**Missing Input**: If input.txt is missing, run `rudolph input` to download it.

**Network Issues**: If you experience connection problems, check your internet connection and try again.

## Commands

### Setup & Fetching

-  **`rudolph setup [year] [day]`** — Create solution files, download input, and fetch puzzle.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Overwrite existing files
   -  `-o, --output-dir <dir>`: Custom output directory

-  **`rudolph input [year] [day]`** — Download puzzle input to `input.txt`.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Re-download even if exists
   -  `-o, --output-dir <dir>`

-  **`rudolph puzzle [year] [day]`** — Download puzzle description to `puzzle.md` (uses cache if available).

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Re-download even if exists
   -  `--no-print`: Don't print puzzle to console
   -  `-o, --output-dir <dir>`

-  **`rudolph refresh [year] [day]`** — Re-fetch puzzle description (useful for getting Part 2 after solving Part 1).
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `-f, --force`: Force refresh even if Part 1 isn't complete locally
   -  `-o, --output-dir <dir>`

### Running Solutions

-  **`rudolph run <target> [year] [day] [part]`** — Run your solution with timing.
   -  `<target>`: `sample` or `input`
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `[part]`: `1`, `2`, or `both` (default: `both`)
   -  `-o, --output-dir <dir>`

### Submitting & Tracking

-  **`rudolph answer <year> <day> <part>`** — Run solution and submit answer to AoC.

   -  `<year>`: Year (e.g., 2024)
   -  `<day>`: Day number (1-25)
   -  `<part>`: `1` or `2`
   -  `--no-refresh`: Skip auto-refreshing puzzle after correct Part 1
   -  `-o, --output-dir <dir>`

-  **`rudolph guesses [year] [day]`** — Show guess history for a specific day.

   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `[day]`: Day (default: today)
   -  `--json`: Output as JSON
   -  `-o, --output-dir <dir>`

-  **`rudolph stars [year]`** — Show collected stars for a year (based on recorded guesses).
   -  `[year]`: Year (default: `AOC_YEAR` or current)
   -  `--json`: Output as JSON
   -  `-o, --output-dir <dir>`

## Solution Format

Generated `index.ts` files follow this structure:

```typescript
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
        ├── index.ts       # Solution file
        ├── puzzle.md      # Puzzle description
        ├── input.txt      # Your puzzle input
        ├── sample.txt     # Sample input (fill this in)
        └── guesses.ndjson # Guess history
```

## Requirements

-  **Runtime**: Bun (recommended) or Node.js 18+ (requires `tsx` for TypeScript execution)
-  **AoC Session**: Provide your session cookie in `.env` before running commands to fetch inputs and submit answers

## License

MIT
