# Create-Rudolph Refactoring Guide

## Goal

Replace the current multi-file, stateful architecture with a single-file, linear flow that:

1. Gathers all configuration upfront
2. Scaffolds the project
3. Runs post-setup tasks

## Prerequisites

```bash
# Create and switch to refactoring branch
git checkout -b refactor/simplify-create-flow

# Verify you're on the right branch
git branch --show-current
# Expected: refactor/simplify-create-flow
```

---

## Phase 1: Create the New Implementation

### Step 1.1: Add Dependencies

**Action:**

```bash
cd packages/create-rudolph
bun add picocolors
```

**Verification:**

```bash
grep "picocolors" package.json
# Expected: "picocolors": "^1.x.x" in dependencies
```

---

### Step 1.2: Create the New Entry Point

**Action:** Create `src/index-new.ts` with the simplified implementation.

```typescript
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
   intro,
   outro,
   text,
   confirm,
   password,
   spinner,
   isCancel,
   cancel,
} from "@clack/prompts";
import { spawn } from "node:child_process";
import color from "picocolors";

// ============================================================================
// Types
// ============================================================================

interface Config {
   projectDir: string; // Absolute path: /Users/you/advent-of-code
   projectName: string; // For package.json: advent-of-code
   solutionsDir: string; // Relative: solutions
   year: string;
   session: string;
   userAgent: string;
   installDeps: boolean;
   initGit: boolean;
   packageManager: string;
}

// ============================================================================
// Utilities
// ============================================================================

function detectPackageManager(): string {
   const ua = process.env.npm_config_user_agent;
   if (!ua) return "npm";
   const [spec] = ua.split(" ");
   const name = spec?.substring(0, spec.lastIndexOf("/"));
   return name === "npminstall" ? "cnpm" : name || "npm";
}

const SAFE_FILES = new Set([
   ".DS_Store",
   ".git",
   ".gitignore",
   ".gitkeep",
   "LICENSE",
   "Thumbs.db",
]);

function isEmpty(dirPath: string): boolean {
   if (!fs.existsSync(dirPath)) return true;
   const contents = fs.readdirSync(dirPath);
   return contents.every(
      (f) =>
         SAFE_FILES.has(f) || f.startsWith(".git") || /^npm-debug\.log/.test(f)
   );
}

function toValidName(name: string): string {
   return name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/^[._]/, "")
      .replace(/[^a-z0-9-~]+/g, "-")
      .replace(/^-+|-+$/g, "");
}

function exec(cmd: string, args: string[], cwd: string): Promise<void> {
   return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { cwd, stdio: "ignore" });
      child.on("error", reject);
      child.on("close", (code) =>
         code === 0 ? resolve() : reject(new Error(`Exit code ${code}`))
      );
   });
}

function bail(message?: string): never {
   cancel(message ?? "Setup cancelled.");
   process.exit(1);
}

function handleCancel<T>(value: T | symbol): T {
   if (isCancel(value)) bail();
   return value as T;
}

// ============================================================================
// Configuration Gathering
// ============================================================================

async function gatherConfig(): Promise<Config> {
   const packageManager = detectPackageManager();
   const currentYear = new Date().getFullYear().toString();

   // Parse CLI arg (first positional argument)
   const cliArg = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
   const yesFlag =
      process.argv.includes("-y") || process.argv.includes("--yes");

   // -------------------------------------------------------------------------
   // 1. Determine project directory
   // -------------------------------------------------------------------------
   let projectDir: string;

   if (!cliArg) {
      // No argument provided → use default or prompt
      const defaultDir = path.resolve("advent-of-code");

      if (yesFlag) {
         projectDir = defaultDir;
      } else if (isEmpty(defaultDir)) {
         // Default is available, but still ask to confirm
         const dirName = handleCancel(
            await text({
               message: "Where should we create your project?",
               placeholder: "advent-of-code",
               initialValue: "advent-of-code",
               validate: (v) => {
                  const resolved = path.resolve(v);
                  return !isEmpty(resolved) ? `"${v}" is not empty` : undefined;
               },
            })
         );
         projectDir = path.resolve(dirName.trim());
      } else {
         // Default exists and isn't empty
         const dirName = handleCancel(
            await text({
               message: `"advent-of-code" exists. Where should we create your project?`,
               placeholder: "my-aoc",
               validate: (v) => {
                  const resolved = path.resolve(v);
                  return !isEmpty(resolved) ? `"${v}" is not empty` : undefined;
               },
            })
         );
         projectDir = path.resolve(dirName.trim());
      }
   } else if (cliArg === "." || cliArg === "./") {
      // Current directory
      projectDir = process.cwd();
      if (!isEmpty(projectDir) && !yesFlag) {
         const proceed = handleCancel(
            await confirm({
               message: `Current directory is not empty. Continue anyway?`,
               initialValue: false,
            })
         );
         if (!proceed) bail("Aborted.");
      }
   } else {
      // Explicit directory name
      projectDir = path.resolve(cliArg);
      if (!isEmpty(projectDir)) {
         if (yesFlag) {
            // Proceed with warning (printed later)
         } else {
            const proceed = handleCancel(
               await confirm({
                  message: `"${cliArg}" is not empty. Continue anyway?`,
                  initialValue: false,
               })
            );
            if (!proceed) {
               const altDir = handleCancel(
                  await text({
                     message: "Where should we create your project?",
                     placeholder: "advent-of-code",
                     validate: (v) => {
                        const resolved = path.resolve(v);
                        return !isEmpty(resolved)
                           ? `"${v}" is not empty`
                           : undefined;
                     },
                  })
               );
               projectDir = path.resolve(altDir.trim());
            }
         }
      }
   }

   // Derive project name from directory
   const projectName =
      toValidName(path.basename(projectDir)) || "advent-of-code";

   // -------------------------------------------------------------------------
   // 2. Solutions directory (relative to project)
   // -------------------------------------------------------------------------
   let solutionsDir: string;
   if (yesFlag) {
      solutionsDir = "solutions";
   } else {
      solutionsDir = handleCancel(
         await text({
            message: "Folder for your daily solutions?",
            placeholder: "solutions",
            initialValue: "solutions",
            validate: (v) =>
               !v.trim() ? "Please enter a folder name" : undefined,
         })
      );
      solutionsDir = solutionsDir.trim() || "solutions";
   }

   // -------------------------------------------------------------------------
   // 3. Year
   // -------------------------------------------------------------------------
   let year: string;
   if (yesFlag) {
      year = currentYear;
   } else {
      year = handleCancel(
         await text({
            message: "Which year are you tackling?",
            placeholder: currentYear,
            initialValue: currentYear,
         })
      );
      year = year.trim() || currentYear;
   }

   // -------------------------------------------------------------------------
   // 4. Session cookie
   // -------------------------------------------------------------------------
   let session = "";
   if (yesFlag) {
      session = "FILL_ME_IN";
   } else {
      const wantsSession = handleCancel(
         await confirm({
            message:
               "Add your AoC session cookie? (needed to download puzzle inputs)",
            initialValue: true,
         })
      );

      if (wantsSession) {
         session = handleCancel(
            await password({
               message:
                  "Paste your 'session' cookie from adventofcode.com (browser dev tools):",
            })
         );
         session = session.trim();
      }
   }

   // -------------------------------------------------------------------------
   // 5. User agent (email)
   // -------------------------------------------------------------------------
   let userAgent = "";
   if (!yesFlag) {
      const wantsUserAgent = handleCancel(
         await confirm({
            message:
               "Include an email in User-Agent? (AoC recommends a contact; optional)",
            initialValue: false,
         })
      );

      if (wantsUserAgent) {
         // Try to get git email as default
         let gitEmail = "";
         try {
            const { execSync } = await import("node:child_process");
            gitEmail = execSync("git config user.email", {
               encoding: "utf-8",
            }).trim();
         } catch {
            // ignore
         }

         userAgent = handleCancel(
            await text({
               message: "Email for User-Agent:",
               placeholder: "you@example.com",
               initialValue: gitEmail,
            })
         );
         userAgent = userAgent.trim();
      }
   }

   // -------------------------------------------------------------------------
   // 6. Install dependencies
   // -------------------------------------------------------------------------
   let installDeps: boolean;
   if (yesFlag) {
      installDeps = true;
   } else {
      installDeps = handleCancel(
         await confirm({
            message: "Install dependencies?",
            initialValue: true,
         })
      );
   }

   // -------------------------------------------------------------------------
   // 7. Initialize git
   // -------------------------------------------------------------------------
   let initGit: boolean;
   if (yesFlag) {
      initGit = true;
   } else {
      // Check if already in a git repo
      const inGitRepo = fs.existsSync(path.join(projectDir, ".git"));
      if (inGitRepo) {
         initGit = false; // Skip, already initialized
      } else {
         initGit = handleCancel(
            await confirm({
               message: "Initialize a git repository?",
               initialValue: true,
            })
         );
      }
   }

   return {
      projectDir,
      projectName,
      solutionsDir,
      year,
      session,
      userAgent,
      installDeps,
      initGit,
      packageManager,
   };
}

// ============================================================================
// Scaffolding
// ============================================================================

async function scaffold(config: Config): Promise<void> {
   const {
      projectDir,
      projectName,
      solutionsDir,
      year,
      session,
      userAgent,
      packageManager,
   } = config;

   // Create directories
   await fs.promises.mkdir(path.join(projectDir, solutionsDir), {
      recursive: true,
   });

   // -------------------------------------------------------------------------
   // package.json
   // -------------------------------------------------------------------------
   const pkg = {
      name: projectName,
      private: true,
      type: "module",
      version: "0.1.0",
      scripts: {
         setup: "rudolph setup",
         "run:input": "rudolph run input",
         "run:sample": "rudolph run sample",
      },
      dependencies: {
         rudolph: "latest",
      },
   };
   await fs.promises.writeFile(
      path.join(projectDir, "package.json"),
      JSON.stringify(pkg, null, 2) + "\n"
   );

   // -------------------------------------------------------------------------
   // .env
   // -------------------------------------------------------------------------
   const envLines: string[] = [
      `AOC_YEAR=${year}`,
      `OUTPUT_DIR=./${solutionsDir}`,
   ];
   if (session) {
      envLines.push(`AOC_SESSION=${session}`);
   } else {
      envLines.push("# AOC_SESSION=your_session_cookie_here");
   }
   if (userAgent) {
      envLines.push(`AOC_USER_AGENT=${userAgent}`);
   }
   await fs.promises.writeFile(
      path.join(projectDir, ".env"),
      envLines.join("\n") + "\n"
   );

   // -------------------------------------------------------------------------
   // .gitignore
   // -------------------------------------------------------------------------
   const gitignoreContent =
      ["node_modules", ".env", "*.log", ".DS_Store"].join("\n") + "\n";
   await fs.promises.writeFile(
      path.join(projectDir, ".gitignore"),
      gitignoreContent
   );

   // -------------------------------------------------------------------------
   // README.md
   // -------------------------------------------------------------------------
   const pmRun = packageManager === "npm" ? "npm run" : `${packageManager}`;
   const readme = `# ${projectName}

My solutions for Advent of Code ${year}.

## Setup

\`\`\`bash
${packageManager} install
\`\`\`

## Usage

\`\`\`bash
${pmRun} setup        # Prepare today's puzzle
${pmRun} run:sample   # Run on sample input
${pmRun} run:input    # Run on real input
\`\`\`

## Structure

\`\`\`
${solutionsDir}/
└── ${year}/
    └── day01/
        ├── index.ts      # Your solution
        ├── input.txt     # Puzzle input
        ├── sample.txt    # Sample input
        └── puzzle.md     # Puzzle description
\`\`\`
`;
   await fs.promises.writeFile(path.join(projectDir, "README.md"), readme);
}

// ============================================================================
// Post-Setup Tasks
// ============================================================================

async function runPostSetup(config: Config): Promise<void> {
   const s = spinner();

   // Install dependencies
   if (config.installDeps) {
      s.start(`Installing dependencies with ${config.packageManager}...`);
      try {
         // Yarn needs a lockfile
         if (config.packageManager === "yarn") {
            const lockPath = path.join(config.projectDir, "yarn.lock");
            if (!fs.existsSync(lockPath)) {
               await fs.promises.writeFile(lockPath, "");
            }
         }
         await exec(config.packageManager, ["install"], config.projectDir);
         s.stop("Dependencies installed");
      } catch (err) {
         s.stop(color.yellow("Failed to install dependencies"));
         console.log(
            color.dim(`  Run "${config.packageManager} install" manually`)
         );
      }
   }

   // Initialize git
   if (config.initGit) {
      s.start("Initializing git repository...");
      try {
         await exec("git", ["init"], config.projectDir);
         await exec("git", ["add", "-A"], config.projectDir);
         await exec(
            "git",
            ["commit", "-m", "Initial commit from create-rudolph 🦌"],
            config.projectDir
         );
         s.stop("Git repository initialized");
      } catch (err) {
         s.stop(color.yellow("Failed to initialize git"));
         console.log(color.dim(`  Run "git init" manually`));
      }
   }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
   console.log();

   intro(
      color.bgRed(color.white(" rudolph ")) +
         " 🎄 Let's set up your Advent of Code workspace"
   );

   const config = await gatherConfig();

   const s = spinner();
   s.start("Scaffolding project...");
   await scaffold(config);
   s.stop("Project scaffolded");

   await runPostSetup(config);

   // -------------------------------------------------------------------------
   // Next Steps
   // -------------------------------------------------------------------------
   const relativePath = path.relative(process.cwd(), config.projectDir);
   const needsCd = relativePath && relativePath !== ".";

   let nextStepsMsg = "";
   if (needsCd) {
      const cdPath = relativePath.includes(" ")
         ? `"${relativePath}"`
         : relativePath;
      nextStepsMsg += `\n  ${color.cyan(`cd ${cdPath}`)}\n`;
   }
   nextStepsMsg += `\n  ${color.cyan(
      `${
         config.packageManager === "npm" ? "npm run" : config.packageManager
      } setup`
   )}`;
   nextStepsMsg += color.dim("  # Prepare today's puzzle\n");

   if (config.session === "FILL_ME_IN" || !config.session) {
      nextStepsMsg += color.dim(
         "\n  Don't forget to add your session cookie to .env\n"
      );
   }

   outro(`Done! Next steps:${nextStepsMsg}\n  Happy coding 🎅`);
}

main().catch((err) => {
   console.error(color.red("Error:"), err.message);
   process.exit(1);
});
```

**Verification:**

```bash
# File should exist and be executable
test -f src/index-new.ts && echo "✓ File created"

# Should compile without errors
bun build src/index-new.ts --outdir=dist-test --target=node
echo "✓ Compiles successfully"

# Cleanup test build
rm -rf dist-test
```

---

## Phase 2: Test the New Implementation

### Step 2.1: Create a Test Script

**Action:** Add a test script to `package.json`:

```json
{
   "scripts": {
      "dev": "bun run src/index.ts",
      "dev:new": "bun run src/index-new.ts",
      "test:new": "bun run src/index-new.ts"
   }
}
```

**Verification:**

```bash
grep "dev:new" package.json
# Expected: "dev:new": "bun run src/index-new.ts"
```

---

### Step 2.2: Run Manual Test Matrix

Create a temporary test directory and run through all scenarios:

```bash
# Setup test environment
mkdir -p /tmp/rudolph-test && cd /tmp/rudolph-test

# Set the path to your package
RUDOLPH_PKG="/path/to/packages/create-rudolph"
```

#### Test 1: Default project name (advent-of-code), default output (solutions), -y flag

```bash
cd /tmp/rudolph-test
rm -rf advent-of-code

bun run $RUDOLPH_PKG/src/index-new.ts -y

# Verify structure
echo "=== Test 1: Default with -y ==="
ls -la advent-of-code/
cat advent-of-code/package.json | grep name
cat advent-of-code/.env

# Expected structure:
# advent-of-code/
# ├── .env
# ├── .git/
# ├── .gitignore
# ├── node_modules/
# ├── package.json
# └── solutions/

# Cleanup
rm -rf advent-of-code
```

#### Test 2: Custom project name, default output (solutions)

```bash
cd /tmp/rudolph-test
rm -rf my-aoc-workshop

bun run $RUDOLPH_PKG/src/index-new.ts my-aoc-workshop -y

echo "=== Test 2: Custom project name ==="
ls -la my-aoc-workshop/
cat my-aoc-workshop/package.json | grep name
# Expected: "name": "my-aoc-workshop"

rm -rf my-aoc-workshop
```

#### Test 3: Current directory (.)

```bash
cd /tmp/rudolph-test
mkdir empty-project && cd empty-project

bun run $RUDOLPH_PKG/src/index-new.ts . -y

echo "=== Test 3: Current directory ==="
ls -la
cat package.json | grep name
# Expected: "name": "empty-project" (derived from dir name)

cd .. && rm -rf empty-project
```

#### Test 4: Interactive mode (no -y flag)

```bash
cd /tmp/rudolph-test

# This will prompt - enter these values:
# - Where: advent-of-code (or press enter)
# - Solutions folder: solutions (or press enter)
# - Year: 2025 (or press enter)
# - Session: (press enter to skip or paste a test value)
# - User-Agent: n
# - Install deps: y
# - Init git: y

bun run $RUDOLPH_PKG/src/index-new.ts

echo "=== Test 4: Interactive ==="
ls -la advent-of-code/

rm -rf advent-of-code
```

#### Test 5: Non-empty directory handling

```bash
cd /tmp/rudolph-test
mkdir -p existing-project && echo "test" > existing-project/file.txt

# Should prompt for confirmation or alternative
bun run $RUDOLPH_PKG/src/index-new.ts existing-project

# If you say "no" to continue, it should prompt for alternative
# If you say "yes", it should proceed

rm -rf existing-project advent-of-code
```

**Verification Checklist:**

```
[ ] Test 1: Default -y creates ./advent-of-code with correct structure
[ ] Test 2: Custom name creates correct directory
[ ] Test 3: "." uses current directory, derives name from basename
[ ] Test 4: Interactive mode prompts for all values
[ ] Test 5: Non-empty directory prompts for confirmation
[ ] All tests: .env contains correct AOC_YEAR and OUTPUT_DIR
[ ] All tests: package.json has correct name
[ ] All tests: README.md is generated
[ ] All tests: .gitignore is generated
```

---

## Phase 3: Replace Old Implementation

### Step 3.1: Backup and Replace

**Action:**

```bash
cd packages/create-rudolph

# Create backup directory
mkdir -p src/_old

# Move old files
mv src/actions src/_old/
mv src/lib src/_old/
mv src/ui src/_old/
mv src/context.ts src/_old/
mv src/index.ts src/_old/

# Rename new file to index.ts
mv src/index-new.ts src/index.ts
```

**Verification:**

```bash
# Old files should be in _old
ls src/_old/
# Expected: actions/ lib/ ui/ context.ts index.ts

# New entry point should exist
test -f src/index.ts && echo "✓ New index.ts exists"

# Should have only index.ts in src/ (plus _old/)
ls src/
# Expected: index.ts _old/
```

---

### Step 3.2: Update package.json bin Entry

**Action:** Verify the bin entry points to the right file:

```bash
cat package.json | grep -A2 '"bin"'
```

Should show:

```json
"bin": {
  "create-rudolph": "./src/index.ts"
}
```

If it points to `dist/index.js`, update your build process accordingly.

**Verification:**

```bash
# Test the package directly
bun run . --help 2>/dev/null || bun run . -y --dry-run
```

---

### Step 3.3: Clean Up Dependencies

**Action:** Check which dependencies are still needed:

```bash
# Old dependencies that may no longer be needed:
# - arg (was used for CLI parsing, now using simple argv check)
# - chalk (replaced with picocolors)

# Review and remove unused:
bun remove arg chalk

# Keep:
# - @clack/prompts
# - picocolors
```

**Verification:**

```bash
# Should still build
bun build src/index.ts --outdir=dist-test --target=node
rm -rf dist-test

# Dependencies should be minimal
cat package.json | grep -A20 '"dependencies"'
```

---

## Phase 4: Final Verification

### Step 4.1: Run Full Test Suite Again

```bash
cd /tmp/rudolph-test

# Clean slate
rm -rf *

# Test all scenarios with the new implementation in place
RUDOLPH_PKG="/path/to/packages/create-rudolph"

# Test 1: bun create simulation
bun run $RUDOLPH_PKG -y
ls -la advent-of-code/
rm -rf advent-of-code

# Test 2: custom name
bun run $RUDOLPH_PKG my-workshop -y
ls -la my-workshop/
rm -rf my-workshop

# Test 3: current dir
mkdir test-cwd && cd test-cwd
bun run $RUDOLPH_PKG . -y
ls -la
cd .. && rm -rf test-cwd
```

---

### Step 4.2: Test with `bun create`

The real test is using `bun create`:

```bash
cd /tmp/rudolph-test

# Link the package for local testing
cd /path/to/packages/create-rudolph
bun link

# Now test bun create
cd /tmp/rudolph-test
bun create @nbbaier/rudolph test-project -y

# Verify
ls -la test-project/
cat test-project/package.json
cat test-project/.env
```

**Verification:**

```
[ ] bun create works without errors
[ ] Project created at ./test-project (not ./test-project/test-project)
[ ] package.json has correct name
[ ] .env has AOC_YEAR and OUTPUT_DIR
[ ] solutions/ directory created
[ ] .gitignore created
[ ] README.md created
[ ] git initialized (if selected)
[ ] dependencies installed (if selected)
```

---

### Step 4.3: Commit Changes

```bash
cd /path/to/packages/create-rudolph

git add -A
git status

# Review what changed
git diff --cached --stat

git commit -m "refactor(create-rudolph): simplify to single-file implementation

- Replace multi-file architecture with linear flow
- Remove overlapping cwd/projectName/solutionsPath confusion
- All config gathered upfront, then scaffold, then post-setup
- ~250 lines instead of 15+ files
- Old implementation preserved in src/_old/ for reference"
```

---

## Phase 5: Cleanup (Optional)

Once you're confident the new implementation works:

```bash
# Remove old implementation backup
rm -rf src/_old

git add -A
git commit -m "chore: remove old implementation backup"
```

---

## Rollback Plan

If something goes wrong:

```bash
# Restore old implementation
mv src/_old/* src/
rm -rf src/_old
mv src/index.ts src/index-new.ts
mv src/index-old.ts src/index.ts  # if you renamed it

# Or just reset
git checkout -- .
```

---

## Summary

| Phase                         | Steps   | Time Est. |
| ----------------------------- | ------- | --------- |
| 1. Create new implementation  | 2 steps | 15 min    |
| 2. Test new implementation    | 2 steps | 20 min    |
| 3. Replace old implementation | 3 steps | 10 min    |
| 4. Final verification         | 3 steps | 15 min    |
| 5. Cleanup                    | 1 step  | 2 min     |

**Total: ~1 hour**

Each step has clear verification criteria. If any step fails verification, stop and debug before proceeding.
