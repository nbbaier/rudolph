# create-rudolph

The easiest way to start your Advent of Code journey. Scaffolds a new workspace with the [`rudolph`](../rudolph) CLI pre-configured.

> **Note**: This is an early release. Use the `@next` tag to install the latest pre-release version.

## Usage

Run the interactive setup wizard:

```bash
# Using bun (recommended)
bun create rudolph@next # defaults to advent-of-code
bun create rudolph@next my-aoc-project # creates a new project called my-aoc-project

# Using npm
npm create rudolph@next
npm create rudolph@next my-aoc-project

# Using pnpm
pnpm create rudolph@next
pnpm create rudolph@next my-aoc-project

# Using yarn
yarn create rudolph@next
yarn create rudolph@next my-aoc-project

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
   -  Writes `.env` with provided values
5. **Git Initialization** — Optionally initializes a git repository.
6. **First Day Setup** — Optionally scaffolds Day 01 immediately.

## Customization Options

### Command Line Flags

```bash
# Skip git initialization
bun create rudolph --no-git

# Skip first day setup
bun create rudolph --no-first-day
```

## Comparison: Manual vs Automated Setup

### Manual Setup (❌ Time-consuming)

```bash
mkdir advent-of-code
cd advent-of-code
bun init -y
bun add rudolph
bun add typescript @types/node --save-dev
# Manually create tsconfig.json
# Manually create .env file
# Manually set up first day
```

### Automated Setup (✅ One command)

```bash
bun create rudolph advent-of-code
```

### Post-Creation Tips

1. **Set up your editor**: Configure VS Code with TypeScript extensions
2. **Create a .gitignore**: Add `node_modules/`, `.env`, and `dist/` to your .gitignore
3. **Set up linting**: Add ESLint or Prettier for consistent code style
4. **Explore the CLI**: Run `rudolph --help` to see all available commands
5. **Join the community**: Share your solutions and learn from others

## Troubleshooting

### Common Issues

**Permission Denied**: If you get permission errors, fix your package manager permissions (avoid `sudo` for installs).

**Network Issues**: If the setup hangs, check your internet connection and proxy settings.

**Session Cookie Problems**: If your session cookie isn't working, double-check it matches your browser's cookie exactly.

**Package Installation Failures**: Try clearing your package manager cache (`npm cache clean --force` or `bun cache rm`).

**Git Initialization Errors**: If git fails, you can manually initialize later with `git init`.

### Debugging

Run with debug logging:

```bash
DEBUG=create-rudolph bunx create-rudolph advent-of-code
```

### Manual Recovery

If setup fails, you can manually:

1. Create the project directory
2. Run `npm init -y`
3. Install dependencies: `npm install rudolph`
4. Create `.env` file with your session cookie
5. Run `rudolph setup` to create your first day

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
