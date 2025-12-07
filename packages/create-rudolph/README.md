# create-rudolph

Scaffold a new Advent of Code workspace with the [rudolph](https://github.com/nbbaier/rudolph) CLI pre-configured and ready to go.

## Usage

Create a new Advent of Code workspace with an interactive setup wizard:

```bash
# Using bunx (recommended)
bunx create-rudolph my-aoc-workspace

# Using npx
npx create-rudolph my-aoc-workspace

# Using pnpm
pnpm create rudolph my-aoc-workspace

# Using yarn
yarn create rudolph my-aoc-workspace
```

## What It Does

The `create-rudolph` scaffolding tool will:

1. **Create your project directory** with the specified name
2. **Set up TypeScript configuration** for writing AoC solutions
3. **Install rudolph CLI** as a dependency
4. **Configure your environment** through an interactive wizard:
   - Set your Advent of Code year
   - Add your AoC session cookie (for downloading puzzles and submitting answers)
   - Set your email for the User-Agent (recommended by AoC creator)
   - Choose your solutions directory structure
5. **Initialize a git repository** (optional)
6. **Set up your first puzzle** (optional)

## After Creation

Once your workspace is created, navigate to it and start solving puzzles:

```bash
cd my-aoc-workspace

# Set up today's puzzle
rudolph setup

# Set up a specific day
rudolph setup 2024 1

# Run your solution against sample input
rudolph run sample

# Run against actual input
rudolph run input

# Submit your answer
rudolph answer 2024 1 1
```

## Project Structure

Your newly created workspace will have this structure:

```
my-aoc-workspace/
├── .env                 # Environment configuration (AOC_SESSION, etc.)
├── .gitignore           # Git ignore rules
├── package.json         # Project dependencies
├── tsconfig.json        # TypeScript configuration
└── aoc/                 # Your solutions directory (configurable)
    └── 2024/
        └── day01/
            ├── index.ts      # Solution file
            ├── puzzle.md     # Puzzle description
            ├── input.txt     # Your puzzle input
            └── sample.txt    # Sample input
```

## Requirements

- **Bun >= 1.3.3** (recommended) or **Node.js >= 18**
- An [Advent of Code](https://adventofcode.com) account

### Getting Your Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser dev tools → Application/Storage → Cookies
3. Copy the `session` cookie value
4. You'll paste this during the `create-rudolph` setup wizard

## Learn More

- [rudolph CLI documentation](https://github.com/nbbaier/rudolph)
- [Advent of Code](https://adventofcode.com)

## License

MIT
