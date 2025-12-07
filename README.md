# rudolph: Advent of Code Helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/@nbbaier/rudolph.svg)](https://badge.fury.io/js/@nbbaier/rudolph)

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

## Features

✅ **One-click setup** - Scaffold new AoC projects instantly with `rudolph init`
✅ **Automatic input fetching** - Download puzzle inputs automatically
✅ **Solution running** - Test against sample and real inputs
✅ **Answer submission** - Submit answers directly from CLI
✅ **Guess tracking** - Keep track of your submission history
✅ **Multi-year support** - Work with multiple AoC years simultaneously

## Prerequisites

- **Node.js** 18+ or **Bun** 1.0+
- A valid Advent of Code session cookie (see [Configuration](#configuration) section)

## Quick Start

The easiest way to get started is to initialize a new workspace:

```bash
# Create a new directory and **initialize**
mkdir advent-of-code && cd advent-of-code
npx @nbbaier/rudolph init

# Or use --yes to skip prompts
npx @nbbaier/rudolph init --yes
```

Once initialized, you can start solving puzzles:

```bash
# Set up today's puzzle
rudolph setup

# Run your solution
rudolph run sample   # Test with sample input
rudolph run input    # Run with real input

# Submit your answer
rudolph answer 2024 1 1
```

## Installation

### Global Installation (recommended)

```bash
# With bun (recommended)
bun install -g @nbbaier/rudolph

# With npm
npm install -g @nbbaier/rudolph

# With pnpm
pnpm add -g @nbbaier/rudolph

# With yarn
yarn global add @nbbaier/rudolph
```

### Project Installation

```bash
# With bun
bun add @nbbaier/rudolph

# With npm
npm install @nbbaier/rudolph
```

### Updating

```bash
# With bun
bun install -g @nbbaier/rudolph@latest

# With npm
npm install -g @nbbaier/rudolph@latest

# With pnpm
pnpm add -g @nbbaier/rudolph@latest

# With yarn
yarn global upgrade @nbbaier/rudolph
```

## Commands

### `rudolph init`

Initialize a new Advent of Code workspace in the current directory.

```bash
rudolph init              # Interactive setup
rudolph init --yes        # Use defaults (skip prompts)
rudolph init --dry-run    # Preview what would be created
rudolph init --pm bun     # Specify package manager
```

### `rudolph setup [year] [day]`

Create day folder, templates, sample stub, and fetch input + puzzle.

```bash
rudolph setup             # Set up today's puzzle
rudolph setup 2024 5      # Set up specific day
rudolph setup --force     # Force re-setup (may overwrite)
```

### `rudolph run <target> [year] [day] [part]`

Run your solution against sample or input data.

```bash
rudolph run sample        # Run with sample input
rudolph run input         # Run with real input
rudolph run input 2024 5  # Run specific day
rudolph run input 2024 5 1  # Run only part 1
```

### `rudolph answer <year> <day> <part>`

Run solution and submit answer to Advent of Code.

```bash
rudolph answer 2024 1 1   # Submit part 1
rudolph answer 2024 1 2   # Submit part 2
rudolph answer 2024 1 both  # Submit both parts
```

### `rudolph puzzle [year] [day]`

Download and display puzzle description.

```bash
rudolph puzzle            # Today's puzzle
rudolph puzzle 2024 5     # Specific day
rudolph puzzle --force    # Re-download
```

### `rudolph input [year] [day]`

Download puzzle input.

```bash
rudolph input             # Today's input
rudolph input 2024 5      # Specific day
rudolph input --force     # Re-download
```

### `rudolph guesses [year] [day]`

Show submission history for a day.

```bash
rudolph guesses 2024 1    # View guesses
rudolph guesses --json    # JSON output
```

### `rudolph stars [year]`

Show star progress for a year.

```bash
rudolph stars             # Current year
rudolph stars 2023        # Specific year
rudolph stars --json      # JSON output
```

## Configuration

Rudolph uses a `.env` file for configuration:

```bash
AOC_SESSION=your-session-cookie
AOC_YEAR=2024
OUTPUT_DIR=./solutions
AOC_USER_AGENT=your.email@example.com
```

### Getting Your Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser developer tools (F12)
3. Go to Application/Storage → Cookies
4. Copy the value of the `session` cookie

## Solution Format

Each day's solution should export a default object with `p1` and `p2` functions:

```typescript
function part1(input: string): number | string {
   // Your solution for part 1
   return 0;
}

function part2(input: string): number | string {
   // Your solution for part 2
   return 0;
}

export default { p1: part1, p2: part2 };
```

## Troubleshooting

**Invalid Session Cookie**: If you see "403 Forbidden" errors, your session cookie may be invalid or expired. Re-copy it from your browser.

**Rate Limiting**: Advent of Code may rate limit requests. Wait a few minutes and try again.

**Missing Input**: If input.txt is missing, run `rudolph input` to download it.

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Run CLI in dev mode
bun run dev

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint
bun run lint:fix

# Format
bun run format:fix
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT
