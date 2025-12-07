# rudolph

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

## Quick Start

The easiest way to get started is with [create-rudolph](https://www.npmjs.com/package/create-rudolph):

```bash
bunx create-rudolph my-aoc-workspace
cd my-aoc-workspace
rudolph setup
```

Or manually in an existing project:

```bash
echo "AOC_SESSION=your-session-cookie" > .env
rudolph setup
```

## Features

- 🎄 **Setup scaffolding** - Generate solution templates and folder structure
- 📥 **Auto-fetch puzzles** - Download puzzle descriptions and input data
- ⚡ **Run solutions** - Execute solutions with timing against sample or actual input
- 🚀 **Submit answers** - Submit directly to AoC with intelligent guardrails
- 📊 **Track progress** - View stars and guess history
- 🔄 **Smart caching** - Cache puzzles and inputs locally
- 🛡️ **Error handling** - Prevent duplicate submissions and handle rate limits

## Documentation

For full documentation, see the [main README](https://github.com/nbbaier/rudolph#readme).

## Commands

- `rudolph setup [year] [day]` - Create day folder and fetch puzzle data
- `rudolph run <target>` - Run solution against sample or input
- `rudolph answer <year> <day> <part>` - Submit answer to AoC
- `rudolph input [year] [day]` - Download puzzle input
- `rudolph puzzle [year] [day]` - Download puzzle description
- `rudolph refresh [year] [day]` - Re-fetch puzzle for part 2
- `rudolph guesses [year] [day]` - View guess history
- `rudolph stars` - Show stars for the year

## Requirements

- **Bun >= 1.3.3** (recommended) or **Node.js >= 18**
- For Node.js: `tsx` must be installed globally or in your project

## License

MIT
