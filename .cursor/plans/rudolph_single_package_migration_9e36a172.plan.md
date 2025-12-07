---
name: Rudolph Single Package Migration
overview: Consolidate the monorepo into a single `@nbbaier/rudolph` package by merging `create-rudolph` functionality into a new `rudolph init` command, with comprehensive test coverage.
todos:
  - id: restructure
    content: Move packages/rudolph to root and merge package.json dependencies
    status: pending
  - id: config
    content: Update tsconfig, biome.json, and build config for single package
    status: pending
  - id: init-command
    content: Create src/commands/init.ts with full scaffolding logic
    status: pending
  - id: init-utils
    content: Port init utilities (prompts, tasks, validation) to src/utils/init/
    status: pending
  - id: wire-init
    content: Add init command to main CLI entry point
    status: pending
  - id: unit-tests
    content: Write unit tests for init utilities and existing utils
    status: pending
  - id: integration-tests
    content: Write integration tests with mocked filesystem/network
    status: pending
  - id: e2e-tests
    content: Write e2e tests that run actual CLI commands
    status: pending
  - id: cleanup
    content: Remove packages/ directory and update README
    status: pending
---

# Rudolph Single Package Migration

## Phase 1: Restructure to Single Package

1. **Move core package to root**

- Move contents of [`packages/rudolph/src/`](packages/rudolph/src/) to `src/`
- Move [`packages/rudolph/tsconfig.json`](packages/rudolph/tsconfig.json) and [`packages/rudolph/tsdown.config.ts`](packages/rudolph/tsdown.config.ts) to root
- Update root [`package.json`](package.json) to become the single publishable package (merge dependencies from both packages, remove workspaces config)

2. **Update configuration files**

- Update [`biome.json`](biome.json) paths for new structure
- Update root `tsconfig.json` for single package
- Keep `.gitignore` patterns for `dist/`

## Phase 2: Implement `rudolph init` Command

3. **Port scaffolding logic**

- Create `src/commands/init.ts` adapting logic from [`packages/create-rudolph/src/`](packages/create-rudolph/src/)
- Port action functions: `intro`, `verify`, `scaffold`, `dependencies`, `git`, etc.
- Create `src/utils/init/` for init-specific utilities (prompts, validation, tasks)

4. **Init command behavior (cwd-only)**

- Check if cwd is empty:
 - **Empty**: Initialize new project in place
 - **Not empty**: Check for existing `package.json`:
 - **Has package.json**: Augment existing project
 - **No package.json**: Prompt to clear directory or exit
- Prompts in order: package manager, project name, solutions dir, year, AOC_SESSION (required), email (optional), install deps, init git, fetch current day
- Display summary, confirm, execute tasks
- Show next steps

5. **Wire up command in main CLI**

- Add `init` command to [`src/index.ts`](packages/rudolph/src/index.ts)

## Phase 3: Test Suite

6. **Unit tests** (`src/**/*.test.ts`)

- Test validation functions, schema parsing, utility helpers
- Test init-specific utilities (prompt logic, detection functions)

7. **Integration tests** (`tests/integration/`)

- Test `init` command with mocked filesystem
- Test existing commands with mocked network/filesystem

8. **End-to-end tests** (`tests/e2e/`)

- Create temp directories and run actual CLI commands
- Verify file creation, structure, content

## Phase 4: Cleanup

9. **Remove old packages**

- Delete `packages/` directory
- Delete unused root files (`SCAFFOLDING_REPORT.md`, etc. if no longer needed)
- Update [`README.md`](README.md) with new usage instructions

10. **Update publish workflow**

 - Single `npm publish` command
 - Update scripts in `package.json`