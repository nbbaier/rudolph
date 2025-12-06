# Advent of Code

This repository contains solutions and a runner for Advent of Code, built with Bun and TypeScript.

## Prerequisites

-  [Bun](https://bun.sh/) (latest version recommended)

## Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```

## Setup

Create a `.env` file in the root directory to store your session cookie. This is required for downloading inputs and puzzle descriptions.

```env
AOC_SESSION=your_session_cookie_here
```

## Usage

The project includes several scripts to help manage and run your solutions. The CLI defaults to the current day and year if options are omitted.

### Scaffolding a New Day

Sets up the directory structure for a new day, creates solution files from templates, and downloads the input and puzzle description.

```bash
bun run scaffold [-d|--day <day>] [-y|--year <year>] [-f|--force]
```

Options:

-  `-d, --day <day>`: Day number (1-25), defaults to current day
-  `-y, --year <year>`: Year (e.g., 2024), defaults to current year
-  `-f, --force`: Force re-download even if files exist

Example:

```bash
bun run scaffold -d 1 -y 2024
```

### Running Solutions

**Test against sample input:**
Runs the solution using `sample.txt`.

```bash
bun run try [-d|--day <day>] [-y|--year <year>]
```

**Run against real input:**
Runs the solution using `input.txt` and displays execution time.

```bash
bun run attempt [-d|--day <day>] [-y|--year <year>]
```

### Reading the Puzzle

Downloads the puzzle description to `puzzle.md` if it doesn't already exist.

```bash
bun run read [-d|--day <day>] [-y|--year <year>] [-f|--force]
```

### Refreshing the Puzzle

Re-downloads the puzzle description (useful after solving part 1 to see part 2).

```bash
bun run refresh [-d|--day <day>] [-y|--year <year>]
```

### Testing

Run all tests using Vitest:

```bash
bun run check
```

Run tests in watch mode:

```bash
bun run watch
```

## Project Structure

-  `src/`: Source code for the CLI and utilities
   -  `src/commands/`: Individual command implementations
   -  `src/utils/`: Utility functions for CLI helpers, downloading, testing, etc.
   -  `src/templates/`: Eta templates (`.eta` files) for generating new solution runners and tests
-  `aoc/[year]/[day]/`: Generated solution files (runner, tests, input, puzzle.md, etc.)

## Templates

Templates use [Eta](https://eta.js.org/) syntax. Variables are accessed via `it` (e.g., `<%= it.year %>`, `<%= it.day %>`). To customize templates, edit the `.eta` files in `src/templates/`.

## \*_License_

MIT
