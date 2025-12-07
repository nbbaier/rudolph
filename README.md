# rudolph: Advent of Code Helper

<div align="center">
  <img src="./banner.png" alt="Rudolph banner">
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://badge.fury.io/js/rudolph.svg)](https://badge.fury.io/js/rudolph)

A powerful CLI tool for Advent of Code enthusiasts. Set up, run, submit, and track your AoC solutions with ease.

## Features

✅ **One-click setup** - Scaffold new AoC projects instantly
✅ **Automatic input fetching** - Download puzzle inputs automatically
✅ **Solution running** - Test against sample and real inputs
✅ **Answer submission** - Submit answers directly from CLI
✅ **Guess tracking** - Keep track of your submission history
✅ **Multi-year support** - Work with multiple AoC years simultaneously

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

### Working with multiple days

```bash
# Set up multiple days at once
for day in {1..5}; do rudolph setup -d $day; done

# Run all solutions
for day in {1..5}; do rudolph run input -d $day; done
```

For full command documentation and configuration details, see the [rudolph package README](./packages/rudolph/README.md).

## Troubleshooting

**Invalid Session Cookie**: If you see "403 Forbidden" errors, your session cookie may be invalid. Double-check it matches your browser's cookie.

**Rate Limiting**: Advent of Code may rate limit requests. Wait a few minutes and try again.

**Missing Input**: If input.txt is missing, run `rudolph input` to download it.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Packages

This is a monorepo containing:

-  **[rudolph](./packages/rudolph)** - The main CLI tool for managing AoC solutions
-  **[create-rudolph](./packages/create-rudolph)** - Interactive scaffolding tool for new workspaces

## Development

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Run rudolph CLI in dev mode
bun run dev

# Run linting
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format:fix

# Type check all packages
bun run typecheck
```

## License

MIT
