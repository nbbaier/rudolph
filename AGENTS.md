# AGENTS.md - Rudolph CLI Repository Guide

## Build & Test Commands

-  `bun run build` - Compile TypeScript to `dist/`
-  `bun run dev` - Run dev server (executes `src/index.ts`)
-  `bun test` - Run all tests
-  `bun run lint` - Run Biome linter
-  `bun run lint:fix` - Fix linting issues
-  `bun run format:fix` - Format code (tabs, double quotes)
-  `bun run typecheck` - Type check with TypeScript

## Architecture & Structure

**Rudolph** is an Advent of Code CLI tool. ESM-only project using Bun/Node 18+.

-  **`src/index.ts`** - Main CLI entry point using Commander.js
-  **`src/commands/`** - Command implementations (init, setup, run, answer, puzzle, etc.)
-  **`src/utils/`** - Shared utilities: CLI helpers (Zod validation), downloading, running solutions, guess tracking
-  **`src/utils/init/`** - Init command utilities: scaffolding, validation, prompts, tasks
-  **`src/errors.ts`** - Custom error classes extending `RudolphError`
-  **`src/env.ts`** - Environment variable loading from `.env`
-  **`tests/`** - Integration and e2e tests

Solution format: `export default { p1: (input: string) => number|string, p2: ... }`

## Code Style & Conventions

-  **TypeScript**: Strict mode, ESNext target, no unused var warnings, verbatim module syntax
-  **Formatting**: Biome with tabs, double quotes (configured in `biome.json`)
-  **Imports**: Organize with Biome, ES modules only (`import`/`export`)
-  **Error Handling**: Always extend `RudolphError` from `src/errors.ts` for domain errors; catch and rethrow as appropriate
-  **Validation**: Use Zod schemas (e.g., `daySchema`, `yearSchema` in `cli-helpers.ts`)
-  **Naming**: camelCase functions/vars, PascalCase classes/types, SCREAMING_SNAKE_CASE for constants
-  **Async**: Fully async/await; commands are async actions
