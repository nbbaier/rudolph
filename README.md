# rudolph: Advent of Code Helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

## Quick Start

The easiest way to get started is to use **[create-rudolph](./packages/create-rudolph)** to scaffold a new workspace:

```bash
bunx create-rudolph advent-of-code
cd advent-of-code
rudolph setup
```

## Installation

If you're setting up manually in an existing project:

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

For full command documentation and configuration details, see the [rudolph package README](./packages/rudolph/README.md).

## Project Structure

This is a monorepo containing:

-  **[rudolph](./packages/rudolph)** - The main CLI tool for managing AoC solutions
-  **[create-rudolph](./packages/create-rudolph)** - Interactive scaffolding tool for new workspaces

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run dev server (executes rudolph CLI)
bun run dev

# Run linting
bun run lint

# Fix linting issues
bun run lint:fix

# Type check
bun run typecheck
```

## License

MIT
