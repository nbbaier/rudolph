# Project Scaffolding Architecture Report

Based on analysis of `create-astro`, this document provides patterns and implementation details for building a CLI scaffolding tool. Extended with patterns for interactive prompts, configuration file generation, and conditional flows.

---

## Table of Contents

- [Project Scaffolding Architecture Report](#project-scaffolding-architecture-report)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Core Dependencies](#core-dependencies)
  - [Package Manager Detection](#package-manager-detection)
  - [Directory Validation](#directory-validation)
    - [Check if Directory is Empty (Safe for Scaffolding)](#check-if-directory-is-empty-safe-for-scaffolding)
    - [Validate/Sanitize Project Name for package.json](#validatesanitize-project-name-for-packagejson)
  - [Interactive Prompts](#interactive-prompts)
    - [Library Options](#library-options)
    - [Prompt Types](#prompt-types)
    - [Handling Cancellation](#handling-cancellation)
    - [Grouping Prompts](#grouping-prompts)
  - [Configuration File Generation](#configuration-file-generation)
    - [Writing .env Files](#writing-env-files)
    - [Adding .env to .gitignore](#adding-env-to-gitignore)
    - [Creating .env.example](#creating-envexample)
  - [Template Download \& Scaffolding](#template-download--scaffolding)
    - [Using giget-core](#using-giget-core)
    - [Template Source Resolution](#template-source-resolution)
  - [Programmatic File Generation](#programmatic-file-generation)
    - [Creating Directory Structure](#creating-directory-structure)
    - [Writing Multiple Files](#writing-multiple-files)
    - [Generating package.json from Scratch](#generating-packagejson-from-scratch)
    - [File Content Templates](#file-content-templates)
  - [package.json Templating](#packagejson-templating)
  - [Post-Processing Files](#post-processing-files)
    - [Remove Unnecessary Files](#remove-unnecessary-files)
    - [Process README with Template Markers](#process-readme-with-template-markers)
  - [Dependency Installation](#dependency-installation)
  - [Git Initialization](#git-initialization)
  - [Shell Command Execution](#shell-command-execution)
  - [Task Queue Pattern](#task-queue-pattern)
  - [CLI Argument Parsing](#cli-argument-parsing)
  - [Simplified Implementation Blueprint](#simplified-implementation-blueprint)
  - [Conditional Post-Scaffolding Actions](#conditional-post-scaffolding-actions)
    - [Pattern: Action Registry](#pattern-action-registry)
    - [Calling Other CLI Commands](#calling-other-cli-commands)
    - [Dependent Actions](#dependent-actions)
  - [Rudolph Init Blueprint](#rudolph-init-blueprint)
    - [Flow Diagram](#flow-diagram)
    - [Context Object](#context-object)
    - [Files to Generate](#files-to-generate)
    - [User Agent Format](#user-agent-format)
    - [Recommended Dependencies](#recommended-dependencies)
  - [Key Takeaways](#key-takeaways)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Entry Point                            │
│  - Check Node version                                       │
│  - Parse CLI arguments → build Context object               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Sequential Steps                           │
│  1. Validate environment                                    │
│  2. Get/validate project directory                          │
│  3. Queue template copy task                                │
│  4. Queue dependency install task                           │
│  5. Queue git init task                                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Execute Task Queue                         │
│  - Run all queued async tasks with progress indicators      │
│  - Handle errors gracefully                                 │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  Show Next Steps                            │
│  - Display cd command                                       │
│  - Display dev server command                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Dependencies

| Package             | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `@bluwy/giget-core` | Download templates from GitHub (lightweight alternative to degit) |
| `@astrojs/cli-kit`  | Interactive prompts, spinners, colored output                     |
| `arg`               | CLI argument parsing                                              |

For a minimal implementation, you could replace `@astrojs/cli-kit` with:

-  `prompts` or `inquirer` for interactive prompts
-  `ora` for spinners
-  `chalk` or `picocolors` for colors

---

## Package Manager Detection

**Location:** `src/actions/context.ts` lines 141-146

Detects which package manager invoked the script via the `npm_config_user_agent` environment variable:

```typescript
function detectPackageManager(): string | undefined {
   if (!process.env.npm_config_user_agent) return;
   // Format: "npm/9.6.7 node/v18.17.0 darwin arm64 workspaces/false"
   const specifier = process.env.npm_config_user_agent.split(" ")[0];
   const name = specifier.substring(0, specifier.lastIndexOf("/"));
   return name === "npminstall" ? "cnpm" : name;
}

// Usage
const packageManager = detectPackageManager() ?? "npm";
```

**Example user agent values:**

-  npm: `npm/9.6.7 node/v18.17.0 darwin arm64`
-  pnpm: `pnpm/8.6.0 npm/? node/v18.17.0`
-  yarn: `yarn/1.22.19 npm/? node/v18.17.0`
-  bun: `bun/1.0.0 node/v18.17.0`

---

## Directory Validation

**Location:** `src/actions/shared.ts`

### Check if Directory is Empty (Safe for Scaffolding)

Certain files/directories are considered "safe" and don't make a directory "non-empty":

```typescript
const VALID_PROJECT_DIRECTORY_SAFE_LIST = [
   ".DS_Store",
   ".git",
   ".gitkeep",
   ".gitattributes",
   ".gitignore",
   ".gitlab-ci.yml",
   ".hg",
   ".hgcheck",
   ".hgignore",
   ".idea",
   ".npmignore",
   ".travis.yml",
   ".yarn",
   ".yarnrc.yml",
   "docs",
   "LICENSE",
   "mkdocs.yml",
   "Thumbs.db",
   /\.iml$/,
   /^npm-debug\.log/,
   /^yarn-debug\.log/,
   /^yarn-error\.log/,
];

function isEmpty(dirPath: string): boolean {
   if (!fs.existsSync(dirPath)) {
      return true;
   }

   const conflicts = fs.readdirSync(dirPath).filter((content) => {
      return !VALID_PROJECT_DIRECTORY_SAFE_LIST.some((safeContent) => {
         return typeof safeContent === "string"
            ? content === safeContent
            : safeContent.test(content);
      });
   });

   return conflicts.length === 0;
}
```

### Validate/Sanitize Project Name for package.json

```typescript
function isValidName(projectName: string): boolean {
   return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
      projectName
   );
}

function toValidName(projectName: string): string {
   if (isValidName(projectName)) return projectName;

   return projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/^[._]/, "")
      .replace(/[^a-z\d\-~]+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
}
```

---

## Interactive Prompts

For CLIs that gather user input interactively (not just CLI flags), use a prompts library.

### Library Options

| Library            | Style           | Notes                                         |
| ------------------ | --------------- | --------------------------------------------- |
| `@clack/prompts`   | Modern, minimal | Beautiful output, great DX, used by SvelteKit |
| `@astrojs/cli-kit` | Astro-specific  | Wraps prompts with Astro branding             |
| `prompts`          | Lightweight     | Simple, no dependencies                       |
| `inquirer`         | Feature-rich    | Heavier, many prompt types                    |

### Prompt Types

**Text Input** - For paths, names, tokens:

```typescript
const projectDir = await text({
   message: "Where should we create your project?",
   placeholder: "./advent-of-code",
   defaultValue: "./advent-of-code",
   validate: (value) => {
      if (!value) return "Directory is required";
      if (!isEmpty(value)) return "Directory is not empty";
   },
});
```

**Password/Secret Input** - For tokens, API keys (masks input):

```typescript
const sessionToken = await password({
   message: "Enter your AOC session token:",
   validate: (value) => {
      if (!value) return "Session token is required";
      if (value.length < 90) return "Token appears too short";
   },
});
```

**Optional Text** - For optional values with defaults:

```typescript
const year = await text({
   message: "Default year for puzzles:",
   placeholder: String(new Date().getFullYear()),
   defaultValue: String(new Date().getFullYear()),
});
```

**Confirm** - For yes/no questions:

```typescript
const shouldInstall = await confirm({
   message: "Install dependencies?",
   initialValue: true,
});
```

**Select** - For choosing from options:

```typescript
const language = await select({
   message: "Which language will you use?",
   options: [
      { value: "typescript", label: "TypeScript" },
      { value: "javascript", label: "JavaScript" },
      { value: "python", label: "Python" },
   ],
});
```

### Handling Cancellation

Users may press Ctrl+C during prompts. Handle gracefully:

```typescript
import { isCancel, cancel } from "@clack/prompts";

const result = await text({ message: "Project name?" });

if (isCancel(result)) {
   cancel("Operation cancelled.");
   process.exit(0);
}
```

### Grouping Prompts

Collect multiple values, with early exit on cancel:

```typescript
import { group } from "@clack/prompts";

const config = await group(
   {
      projectDir: () => text({ message: "Project directory?" }),
      solutionsDir: () => text({ message: "Solutions directory?" }),
      year: () => text({ message: "Default year?" }),
      session: () => password({ message: "AOC session token?" }),
      email: () => text({ message: "Your email (optional)?" }),
   },
   {
      onCancel: () => {
         cancel("Setup cancelled.");
         process.exit(0);
      },
   }
);
// config.projectDir, config.solutionsDir, etc.
```

---

## Configuration File Generation

### Writing .env Files

For environment configuration with secrets:

```typescript
interface EnvConfig {
   AOC_SESSION: string;
   OUTPUT_DIR: string;
   AOC_YEAR: string;
   AOC_USER_AGENT?: string;
}

function generateEnvFile(config: EnvConfig): string {
   const lines: string[] = [];

   for (const [key, value] of Object.entries(config)) {
      if (value !== undefined && value !== "") {
         // Quote values that contain spaces or special characters
         const needsQuotes = /[\s#=]/.test(value);
         lines.push(`${key}=${needsQuotes ? `"${value}"` : value}`);
      }
   }

   return lines.join("\n") + "\n";
}

// Usage
const envContent = generateEnvFile({
   AOC_SESSION: sessionToken,
   OUTPUT_DIR: "./solutions",
   AOC_YEAR: "2025",
   AOC_USER_AGENT: email ? `github.com/user/repo by ${email}` : undefined,
});

await fs.promises.writeFile(path.join(cwd, ".env"), envContent);
```

### Adding .env to .gitignore

Ensure secrets aren't committed:

```typescript
async function ensureGitignore(cwd: string, entries: string[]) {
   const gitignorePath = path.join(cwd, ".gitignore");

   let content = "";
   if (fs.existsSync(gitignorePath)) {
      content = await fs.promises.readFile(gitignorePath, "utf-8");
   }

   const lines = content.split("\n");
   const toAdd = entries.filter((entry) => !lines.includes(entry));

   if (toAdd.length > 0) {
      const newContent = content.trimEnd() + "\n" + toAdd.join("\n") + "\n";
      await fs.promises.writeFile(gitignorePath, newContent);
   }
}

// Usage
await ensureGitignore(cwd, [".env", ".env.local", "node_modules"]);
```

### Creating .env.example

Provide a template without secrets:

```typescript
function generateEnvExample(config: EnvConfig): string {
   return `# Copy this to .env and fill in your values
AOC_SESSION=your-session-cookie-here
OUTPUT_DIR=${config.OUTPUT_DIR}
AOC_YEAR=${config.AOC_YEAR}
AOC_USER_AGENT=github.com/your-username/advent-of-code by your@email.com
`;
}
```

---

## Template Download & Scaffolding

**Location:** `src/actions/template.ts`

### Using giget-core

```typescript
import { downloadTemplate } from "@bluwy/giget-core";

// Template source formats:
// - GitHub repo: "github:owner/repo"
// - GitHub branch: "github:owner/repo#branch-name"
// - GitHub subdirectory: "github:owner/repo/path/to/dir#branch"
// - Third-party (passed through): "owner/repo" or full URL

async function copyTemplate(templateTarget: string, cwd: string) {
   await downloadTemplate(templateTarget, {
      force: true, // Overwrite existing files
      cwd: cwd, // Target directory
      dir: ".", // Subdirectory within cwd (use '.' for cwd itself)
   });
}
```

### Template Source Resolution

```typescript
function getTemplateTarget(tmpl: string, ref = "latest"): string {
   // For a single template, you might just return a fixed value:
   // return 'github:your-org/your-template-repo';

   // Or with branch/tag reference:
   if (ref === "latest") {
      return `github:your-org/your-repo#main`;
   } else {
      return `github:your-org/your-repo#${ref}`;
   }
}
```

---

## Programmatic File Generation

When you're not downloading a template but creating files from scratch:

### Creating Directory Structure

```typescript
async function createProjectStructure(cwd: string, dirs: string[]) {
   // Ensure base directory exists
   await fs.promises.mkdir(cwd, { recursive: true });

   // Create subdirectories
   for (const dir of dirs) {
      await fs.promises.mkdir(path.join(cwd, dir), { recursive: true });
   }
}

// Usage
await createProjectStructure(projectDir, [
   "solutions",
   "solutions/2025",
   "lib",
]);
```

### Writing Multiple Files

```typescript
interface FileToCreate {
   path: string;
   content: string;
}

async function writeFiles(cwd: string, files: FileToCreate[]) {
   await Promise.all(
      files.map(async ({ path: filePath, content }) => {
         const fullPath = path.join(cwd, filePath);
         // Ensure parent directory exists
         await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
         await fs.promises.writeFile(fullPath, content);
      })
   );
}

// Usage
await writeFiles(projectDir, [
   { path: ".env", content: envContent },
   { path: ".env.example", content: envExampleContent },
   { path: ".gitignore", content: gitignoreContent },
   { path: "package.json", content: packageJsonContent },
   { path: "README.md", content: readmeContent },
]);
```

### Generating package.json from Scratch

```typescript
interface PackageJsonOptions {
   name: string;
   description?: string;
   dependencies?: Record<string, string>;
   devDependencies?: Record<string, string>;
   scripts?: Record<string, string>;
}

function generatePackageJson(options: PackageJsonOptions): string {
   const pkg = {
      name: options.name,
      version: "1.0.0",
      type: "module",
      description: options.description ?? "",
      scripts: options.scripts ?? {},
      dependencies: options.dependencies ?? {},
      devDependencies: options.devDependencies ?? {},
   };

   return JSON.stringify(pkg, null, 2) + "\n";
}

// Usage
const packageJson = generatePackageJson({
   name: "advent-of-code-2025",
   description: "My Advent of Code solutions",
   scripts: {
      solve: "rudolph solve",
      test: "rudolph test",
   },
   dependencies: {
      rudolph: "^1.0.0",
   },
});
```

### File Content Templates

Use template literals for file content:

```typescript
function generateReadme(projectName: string, year: string): string {
   return `# ${projectName}

My solutions for [Advent of Code ${year}](https://adventofcode.com/${year}).

## Setup

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
# Scaffold a new day
npm run new

# Run today's solution
npm run solve
\`\`\`

## Structure

\`\`\`
solutions/
  ${year}/
    day01/
      solution.ts
      input.txt
\`\`\`
`;
}
```

---

## package.json Templating

**Location:** `src/actions/template.ts` lines 96-111

After downloading the template, update `package.json` with the project name:

```typescript
const FILES_TO_UPDATE = {
   "package.json": async (filePath: string, overrides: { name: string }) => {
      const content = await fs.promises.readFile(filePath, "utf-8");

      // Preserve original indentation
      const indent = /(^\s+)/m.exec(content)?.[1] ?? "\t";

      const pkg = JSON.parse(content);

      // Merge overrides and remove `private` field
      const updated = {
         ...pkg,
         ...overrides,
         private: undefined, // Remove private field for published packages
      };

      await fs.promises.writeFile(
         filePath,
         JSON.stringify(updated, null, indent),
         "utf-8"
      );
   },
};

// Usage
const pkgPath = path.resolve(cwd, "package.json");
if (fs.existsSync(pkgPath)) {
   await FILES_TO_UPDATE["package.json"](pkgPath, { name: projectName });
}
```

---

## Post-Processing Files

**Location:** `src/actions/template.ts`

### Remove Unnecessary Files

Some files are only needed for the template repo itself, not end users:

```typescript
const FILES_TO_REMOVE = ["CHANGELOG.md", ".codesandbox"];

async function cleanupFiles(cwd: string) {
   await Promise.all(
      FILES_TO_REMOVE.map(async (file) => {
         const filePath = path.resolve(cwd, file);
         if (fs.existsSync(filePath)) {
            return fs.promises.rm(filePath, { recursive: true });
         }
      })
   );
}
```

### Process README with Template Markers

Remove sections meant only for template maintainers:

```typescript
/**
 * Template marker format:
 * <!-- TEMPLATE:REMOVE:START -->
 * Content to remove (e.g., "Click 'Use Template' button")
 * <!-- TEMPLATE:REMOVE:END -->
 */
function removeTemplateMarkerSections(content: string): string {
   const pattern =
      /<!--\s*TEMPLATE:REMOVE:START\s*-->[\s\S]*?<!--\s*TEMPLATE:REMOVE:END\s*-->/gi;

   let result = content.replace(pattern, "");

   // Clean up extra whitespace
   result = result.replace(/\n{3,}/g, "\n\n");

   return result;
}

function processReadme(content: string, packageManager: string): string {
   let processed = removeTemplateMarkerSections(content);

   // Replace package manager references
   if (packageManager !== "npm") {
      processed = processed
         .replace(/\bnpm run\b/g, packageManager)
         .replace(/\bnpm\b/g, packageManager);
   }

   return processed;
}
```

---

## Dependency Installation

**Location:** `src/actions/dependencies.ts`

```typescript
async function install(packageManager: string, cwd: string): Promise<void> {
   // Special handling for Yarn Berry (PnP)
   if (packageManager === "yarn") {
      await ensureYarnLock(cwd);
   }

   await shell(packageManager, ["install"], {
      cwd,
      timeout: 90_000, // 90 second timeout
      stdio: "ignore", // Suppress output
   });
}

/**
 * Yarn Berry requires yarn.lock to exist before install
 */
async function ensureYarnLock(cwd: string): Promise<void> {
   const yarnLock = path.join(cwd, "yarn.lock");
   if (!fs.existsSync(yarnLock)) {
      await fs.promises.writeFile(yarnLock, "", { encoding: "utf-8" });
   }
}
```

---

## Git Initialization

**Location:** `src/actions/git.ts`

```typescript
async function initGit(cwd: string, commitMessage: string): Promise<void> {
   // Skip if already a git repo
   if (fs.existsSync(path.join(cwd, ".git"))) {
      return;
   }

   try {
      await shell("git", ["init"], { cwd, stdio: "ignore" });
      await shell("git", ["add", "-A"], { cwd, stdio: "ignore" });
      await shell(
         "git",
         [
            "commit",
            "-m",
            `"${commitMessage}"`,
            '--author="bot <bot@example.com>"',
         ],
         { cwd, stdio: "ignore" }
      );
   } catch {
      // Silently fail - git init is optional
   }
}
```

---

## Shell Command Execution

**Location:** `src/shell.ts`

A lightweight alternative to `execa`:

```typescript
import {
   spawn,
   type ChildProcess,
   type StdioOptions,
} from "node:child_process";
import type { Readable } from "node:stream";
import { text as textFromStream } from "node:stream/consumers";

interface ShellOptions {
   cwd?: string;
   stdio?: StdioOptions;
   timeout?: number;
}

interface ShellOutput {
   stdout: string;
   stderr: string;
   exitCode: number;
}

async function shell(
   command: string,
   args: string[],
   opts: ShellOptions = {}
): Promise<ShellOutput> {
   const text = (stream: Readable | null) =>
      stream ? textFromStream(stream).then((t) => t.trimEnd()) : "";

   let child: ChildProcess;
   let stdout = "";
   let stderr = "";

   try {
      child = spawn(`${command} ${args.join(" ")}`, {
         cwd: opts.cwd,
         shell: true,
         stdio: opts.stdio,
         timeout: opts.timeout,
      });

      const done = new Promise((resolve) => child.on("close", resolve));
      [stdout, stderr] = await Promise.all([
         text(child.stdout),
         text(child.stderr),
      ]);
      await done;
   } catch {
      throw { stdout, stderr, exitCode: 1 };
   }

   if (child.exitCode === null) {
      throw new Error("Timeout");
   }
   if (child.exitCode !== 0) {
      throw new Error(stderr);
   }

   return { stdout, stderr, exitCode: child.exitCode };
}
```

---

## Task Queue Pattern

**Location:** `src/index.ts`

Tasks are queued during the interactive phase, then executed together with progress indicators:

```typescript
interface Task {
   pending: string; // Label while waiting
   start: string; // Label when starting
   end: string; // Label when complete
   while: () => Promise<void>; // The async work
   onError?: (error: Error) => void;
}

// During steps, queue tasks:
ctx.tasks.push({
   pending: "Template",
   start: "Copying template...",
   end: "Template copied",
   while: () => copyTemplate(templateTarget, cwd),
});

ctx.tasks.push({
   pending: "Dependencies",
   start: "Installing dependencies...",
   end: "Dependencies installed",
   while: () => install(packageManager, cwd),
   onError: (e) => {
      console.error("Failed to install dependencies");
      console.error(`Run "${packageManager} install" manually`);
   },
});

// Execute all tasks with progress UI
await runTasks(ctx.tasks);
```

---

## CLI Argument Parsing

**Location:** `src/actions/context.ts`

Using the `arg` package:

```typescript
import arg from "arg";

const flags = arg(
   {
      // String flags
      "--template": String,
      "--ref": String,

      // Boolean flags
      "--yes": Boolean,
      "--no": Boolean,
      "--install": Boolean,
      "--no-install": Boolean,
      "--git": Boolean,
      "--no-git": Boolean,
      "--dry-run": Boolean,
      "--help": Boolean,

      // Array flags (can be repeated)
      "--add": [String],

      // Aliases
      "-y": "--yes",
      "-n": "--no",
      "-h": "--help",
   },
   {
      argv: process.argv.slice(2),
      permissive: true, // Don't error on unknown flags
   }
);

// Positional argument (project directory)
const projectDir = flags["_"][0];

// Access flags
const dryRun = flags["--dry-run"];
const skipInstall = flags["--no-install"];
```

---

## Simplified Implementation Blueprint

For a single-template scaffolder, here's a minimal implementation:

```typescript
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { downloadTemplate } from "@bluwy/giget-core";
import arg from "arg";

// ============ Configuration ============
const TEMPLATE_REPO = "github:your-org/your-template#main";
const FILES_TO_REMOVE = ["CHANGELOG.md", ".codesandbox"];

// ============ Utilities ============
function detectPackageManager(): string {
   const ua = process.env.npm_config_user_agent;
   if (!ua) return "npm";
   const name = ua.split(" ")[0].split("/")[0];
   return name === "npminstall" ? "cnpm" : name;
}

function toValidName(name: string): string {
   return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/^[._]/, "")
      .replace(/[^a-z\d\-~]+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
}

async function shell(cmd: string, args: string[], cwd: string): Promise<void> {
   return new Promise((resolve, reject) => {
      const child = spawn(`${cmd} ${args.join(" ")}`, {
         cwd,
         shell: true,
         stdio: "inherit",
      });
      child.on("close", (code) => {
         code === 0 ? resolve() : reject(new Error(`Exit code ${code}`));
      });
   });
}

// ============ Main ============
async function main() {
   const flags = arg(
      {
         "--yes": Boolean,
         "--no-install": Boolean,
         "--no-git": Boolean,
         "--help": Boolean,
         "-y": "--yes",
         "-h": "--help",
      },
      { argv: process.argv.slice(2), permissive: true }
   );

   if (flags["--help"]) {
      console.log(`
Usage: create-my-app [directory] [options]

Options:
  --yes, -y       Accept all defaults
  --no-install    Skip dependency installation
  --no-git        Skip git initialization
  --help, -h      Show this help
`);
      process.exit(0);
   }

   const projectDir = flags["_"][0] || "my-project";
   const cwd = path.resolve(projectDir);
   const projectName = toValidName(path.basename(cwd));
   const pm = detectPackageManager();

   console.log(`\n Creating ${projectName}...\n`);

   // 1. Download template
   await downloadTemplate(TEMPLATE_REPO, { force: true, cwd, dir: "." });

   // 2. Update package.json
   const pkgPath = path.join(cwd, "package.json");
   if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      pkg.name = projectName;
      delete pkg.private;
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
   }

   // 3. Remove unnecessary files
   for (const file of FILES_TO_REMOVE) {
      const filePath = path.join(cwd, file);
      if (fs.existsSync(filePath)) {
         fs.rmSync(filePath, { recursive: true });
      }
   }

   // 4. Install dependencies
   if (!flags["--no-install"]) {
      console.log(` Installing dependencies with ${pm}...`);
      await shell(pm, ["install"], cwd);
   }

   // 5. Initialize git
   if (!flags["--no-git"]) {
      console.log(" Initializing git...");
      try {
         await shell("git", ["init"], cwd);
         await shell("git", ["add", "-A"], cwd);
         await shell("git", ["commit", "-m", '"Initial commit"'], cwd);
      } catch {}
   }

   // 6. Done!
   console.log(`
 Done! Next steps:

   cd ${projectDir}
   ${pm} run dev
`);
}

main().catch(console.error);
```

---

## Conditional Post-Scaffolding Actions

Handle optional steps that depend on user choices:

### Pattern: Action Registry

```typescript
interface PostAction {
   name: string;
   condition: () => boolean;
   run: () => Promise<void>;
}

async function runPostActions(actions: PostAction[]) {
   for (const action of actions) {
      if (action.condition()) {
         console.log(`Running: ${action.name}...`);
         await action.run();
      }
   }
}

// Usage
const postActions: PostAction[] = [
   {
      name: "Install dependencies",
      condition: () => config.shouldInstall,
      run: () => install(packageManager, cwd),
   },
   {
      name: "Initialize git",
      condition: () => config.shouldGit,
      run: () => initGit(cwd),
   },
   {
      name: "Setup first day",
      condition: () => config.setupFirstDay,
      run: () => setupDay(cwd, config.year, 1),
   },
];

await runPostActions(postActions);
```

### Calling Other CLI Commands

When post-scaffolding needs to run other commands from your own CLI:

```typescript
async function setupDay(cwd: string, year: string, day: number) {
   // Option 1: Shell out to your own CLI
   await shell("npx", ["rudolph", "new", "--day", String(day)], { cwd });

   // Option 2: Import and call the function directly (preferred)
   // This avoids spawning a new process
   const { newDay } = await import("./commands/new.js");
   await newDay({ cwd, year, day });
}
```

### Dependent Actions

Some actions depend on others completing first:

```typescript
// Dependencies must install before we can run astro add
if (config.shouldInstall) {
   await install(packageManager, cwd);

   // Now we can run commands that need dependencies
   if (config.setupFirstDay) {
      await setupDay(cwd, config.year, 1);
   }
}
```

---

## Rudolph Init Blueprint

Specific architecture for `rudolph init`:

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DETECT ENVIRONMENT                                       │
│    - Package manager from npm_config_user_agent             │
│    - Current year for default                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. INTERACTIVE PROMPTS (using @clack/prompts)               │
│    - Project directory     (default: ./advent-of-code)      │
│    - Solutions directory   (default: ./solutions)           │
│    - Default year          (default: current year)          │
│    - AOC session token     (required, password input)       │
│    - User email            (optional)                       │
│    - Install dependencies? (confirm)                        │
│    - Initialize git?       (confirm)                        │
│    - Setup first day?      (confirm)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CREATE PROJECT STRUCTURE                                 │
│    ./advent-of-code/                                        │
│    ├── .env                (AOC_SESSION, OUTPUT_DIR, etc.)  │
│    ├── .env.example        (template without secrets)       │
│    ├── .gitignore          (includes .env)                  │
│    ├── package.json        (with rudolph dependency)        │
│    ├── README.md                                            │
│    └── solutions/          (empty, or with day-01 if setup) │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. POST-SCAFFOLDING ACTIONS (conditional)                   │
│    - Install dependencies (if yes)                          │
│    - Initialize git (if yes)                                │
│    - Setup first day (if yes, requires install first)       │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SHOW NEXT STEPS                                          │
│    cd ./advent-of-code                                      │
│    npm run solve                                            │
└─────────────────────────────────────────────────────────────┘
```

### Context Object

```typescript
interface RudolphInitContext {
   // Environment
   packageManager: string;
   currentYear: number;

   // User inputs
   projectDir: string;
   solutionsDir: string;
   year: string;
   sessionToken: string;
   email?: string;

   // Options
   shouldInstall: boolean;
   shouldGit: boolean;
   setupFirstDay: boolean;

   // Resolved paths
   cwd: string; // Absolute path to project directory
}
```

### Files to Generate

| File           | Content                                                   |
| -------------- | --------------------------------------------------------- |
| `.env`         | `AOC_SESSION`, `OUTPUT_DIR`, `AOC_YEAR`, `AOC_USER_AGENT` |
| `.env.example` | Same keys with placeholder values                         |
| `.gitignore`   | `.env`, `.env.local`, `node_modules`, etc.                |
| `package.json` | Name, rudolph dependency, scripts                         |
| `README.md`    | Project description, setup instructions                   |

### User Agent Format

AOC requests a user agent with contact info:

```typescript
function generateUserAgent(email?: string, repo?: string): string {
   const parts = ["github.com/user/advent-of-code"];
   if (email) {
      parts.push(`by ${email}`);
   }
   return parts.join(" ");
}
```

### Recommended Dependencies

```json
{
   "dependencies": {
      "@clack/prompts": "^0.7.0"
   },
   "devDependencies": {
      "arg": "^5.0.2"
   }
}
```

No need for `giget-core` since you're generating files, not downloading a template.

---

## Key Takeaways

1. **Package manager detection** via `npm_config_user_agent` is reliable and simple
2. **@clack/prompts** provides modern, beautiful interactive prompts
3. **Password prompt type** masks sensitive input like session tokens
4. **Generate files programmatically** when you have a fixed structure (no template download needed)
5. **.env + .env.example + .gitignore** is the pattern for config with secrets
6. **Task queue pattern** separates interactive prompts from async operations
7. **Directory safe list** prevents false "not empty" errors for common files
8. **Yarn Berry** needs special handling (empty yarn.lock file)
9. **Conditional post-actions** let users opt into install, git, first day setup
10.   **Graceful cancellation** via `isCancel()` check after each prompt
