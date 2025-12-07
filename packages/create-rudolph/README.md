# create-rudolph

The easiest way to start your Advent of Code journey. Scaffolds a new workspace with the [rudolph](https://www.npmjs.com/package/rudolph) CLI pre-configured.

## Usage

Run the interactive setup wizard:

```bash
# Using bun (recommended)
bunx create-rudolph advent-of-code

# Using npm
npx create-rudolph advent-of-code

# Using pnpm
pnpm create rudolph advent-of-code

# Using yarn
yarn create rudolph advent-of-code
```

## Features

The `create-rudolph` tool automates the setup process:

1. **Project Creation** — Creates a directory with your chosen name.
2. **TypeScript Setup** — Configures `tsconfig.json` for modern TypeScript.
3. **CLI Installation** — Installs `rudolph` as a dependency.
4. **Environment Config** — Interactive wizard to set your:
   -  AoC Session Cookie
   -  Target Year
   -  User-Agent Email
5. **Git Initialization** — Optionally initializes a git repository.
6. **First Day Setup** — Optionally scaffolds Day 01 immediately.

## After Creation

Once your workspace is ready:

```bash
cd advent-of-code

# Set up today's puzzle
rudolph setup

# Set up a specific day
rudolph setup -y 2024 -d 1

# Run solution against sample input
rudolph run sample

# Run against actual input
rudolph run input

# Submit answer for Part 1
rudolph answer 2024 1 1
```

## Project Structure

```
advent-of-code/
├── .env           # Secrets (AOC_SESSION)
├── package.json   # Dependencies
├── tsconfig.json  # TS Config
└── aoc/           # Solutions Directory
    └── 2024/
        └── day01/
            ├── index.ts   # Solution logic
            ├── puzzle.md  # Puzzle description
            ├── input.txt  # Puzzle input
            └── sample.txt # Sample input
```

## License

MIT
