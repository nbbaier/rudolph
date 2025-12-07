# Simplified Create Flow - Implementation Guide

## Overview

The create-rudolph CLI should follow a clean, linear flow:

1. **Parse CLI arguments** (context.ts)
2. **Infer project directory and check emptiness** (project-name.ts)
3. **Get output directory name** (solutions.ts)
4. **Gather remaining config** (session, email, year, etc.)
5. **Create files** (scaffold.ts)

This guide consolidates all the project directory logic into `project-name.ts`, where it belongs conceptually.

---

## Architecture

### context.ts - Minimal

Only responsibilities:
- Parse CLI flags using `arg`
- Store the raw CLI argument (`cliArg`)
- Store parsed flags
- Detect package manager
- That's it

**What NOT to do:**
- Don't resolve the target directory
- Don't infer project names
- Don't check if directories are empty
- Don't determine if the argument was "explicitly provided"

**Example structure:**
```typescript
export interface Context {
  cliArg?: string;           // Raw arg from CLI (could be ".", "my-project", undefined)
  packageManager: string;
  dryRun?: boolean;
  yes?: boolean;
  // ... other flags ...
  projectName?: string;      // Set by project-name.ts
  cwd?: string;              // Set by project-name.ts
  // ... rest of config ...
  tasks: Task[];
  exit(code: number): never;
}
```

---

### project-name.ts - All Directory Logic

Single responsibility: "Figure out where the project goes and what its name is"

**Flow:**

```
1. Infer the target directory path:
   - If cliArg is undefined
     → targetPath = resolve(process.cwd(), "advent-of-code")
     → isDefaultDir = true
   - If cliArg is "." or "./"
     → targetPath = process.cwd()
     → isDefaultDir = false
   - If cliArg is any other string
     → targetPath = resolve(process.cwd(), cliArg)
     → isDefaultDir = false

2. Check if targetPath is empty:
   - If empty
     → Extract project name from path
     → Done
   - If NOT empty
     → If --yes flag
       → If isDefaultDir = true (no arg provided)
         → This shouldn't happen (advent-of-code won't exist usually)
       → If isDefaultDir = false (explicit arg provided)
         → Show warning "is not empty!"
         → Continue with that directory anyway
     → If no --yes flag
       → Show warning "is not empty!"
       → Prompt user for alternative directory
       → Validate it's empty, repeat if not
       → Use that directory instead

3. Extract project name:
   - If targetPath = process.cwd() (user provided ".")
     → name = basename(process.cwd())
   - Else if targetPath = "./advent-of-code"
     → name = "advent-of-code"
   - Else
     → name = basename(targetPath)
   - Normalize with toValidName()

4. Set ctx.cwd and ctx.projectName
```

**Key insight:** The "default directory" (`advent-of-code`) is only used when the user provides no argument. If they explicitly provide ".", they're saying "use this directory" and we respect that, even if it's not empty (with a warning).

---

## Implementation Details

### Step 1: Simplify context.ts

Remove:
- `projectNameExplicitlyProvided` (unnecessary)
- The resolved `cwd` calculation
- The normalized project name handling

Add:
- Simple `cliArg?: string` field to store `flags._[0]`

```typescript
export async function getContext(argv: string[]): Promise<Context> {
  const flags = arg(...);
  const cliArg = flags._[0];  // Could be undefined, ".", "my-project", etc.
  
  const context: Context = {
    cliArg,
    packageManager: detectPackageManager() ?? "npm",
    dryRun: flags["--dry-run"],
    yes: flags["--yes"],
    // ... other flags ...
    tasks: [],
    exit(code) { process.exit(code); },
  };
  
  return context;
}
```

### Step 2: Rewrite project-name.ts

This action now handles all the directory inference and validation logic.

**Function signature:**
```typescript
export async function projectName(
  ctx: Pick<
    Context,
    "cliArg" | "yes" | "dryRun" | "exit" | "cwd" | "projectName"
  >,
) {
  // 1. Infer target path
  // 2. Check if empty
  // 3. Prompt if needed
  // 4. Extract project name
  // 5. Set ctx.cwd and ctx.projectName
}
```

**Pseudocode:**
```typescript
export async function projectName(ctx) {
  // Step 1: Infer the target directory
  let targetPath: string;
  let isDefaultDir = false;
  
  if (!ctx.cliArg) {
    // No argument: use default
    targetPath = path.resolve(process.cwd(), "advent-of-code");
    isDefaultDir = true;
  } else if (ctx.cliArg === "." || ctx.cliArg === "./") {
    // Current directory
    targetPath = process.cwd();
  } else {
    // Custom path
    targetPath = path.resolve(process.cwd(), ctx.cliArg);
  }

  // Step 2: Check if empty
  const empty = isEmpty(targetPath);

  if (!empty) {
    // Directory is not empty
    await info("Hmm...", `"${targetPath}" is not empty!`);

    if (ctx.yes || isDefaultDir) {
      // --yes flag: proceed with warning, OR default dir (shouldn't happen)
      if (!isDefaultDir) {
        // User explicitly asked for this dir, let them have it
      }
    } else {
      // Interactive mode: prompt for alternative
      const alt = await text({
        message: "Where should we create your project?",
        placeholder: "advent-of-code",
        initialValue: "advent-of-code",
        validate(value: string) {
          if (!isEmpty(value)) {
            return "Directory is not empty!";
          }
          return undefined;
        },
      });
      if (isCancel(alt)) ctx.exit(1);
      targetPath = path.resolve(process.cwd(), alt.trim());
    }
  } else {
    // Directory is empty
    if (!isDefaultDir) {
      await info("dir", `Using ${targetPath} as project directory`);
    }
  }

  // Step 3: Extract project name
  let projectName: string;
  if (ctx.cliArg === "." || ctx.cliArg === "./") {
    // Current directory: use its basename
    const parts = process.cwd().split(path.sep);
    projectName = parts[parts.length - 1] ?? "";
  } else {
    // Use the resolved path's basename
    projectName = path.basename(targetPath);
  }
  projectName = toValidName(projectName);

  // Step 4: Store in context
  ctx.cwd = targetPath;
  ctx.projectName = projectName;

  if (!ctx.cwd || !ctx.projectName) {
    ctx.exit(1);
  }
}
```

---

## Why This Is Better

| Aspect | Before | After |
|--------|--------|-------|
| **Lines of logic per file** | Spread across context.ts + project-name.ts | All in project-name.ts |
| **Extra context fields** | `projectNameExplicitlyProvided` | Just `cliArg` |
| **Path resolution** | Happens in context.ts | Happens in project-name.ts |
| **Directory check** | Multiple conditional branches | Single linear flow |
| **Test scope** | Need to test context + action separately | Test action handles all cases |

---

## Testing Scenarios

After implementing, test these cases:

```bash
# No argument: creates ./advent-of-code
bun run . --dry-run --yes

# Explicit current directory (empty): scaffolds here
mkdir /tmp/empty-aoc && cd /tmp/empty-aoc && bun run . --dry-run --yes

# Explicit current directory (not empty): warns but proceeds
cd /tmp/empty-aoc && touch file.txt && bun run . --dry-run --yes

# Custom directory (empty): scaffolds there
bun run my-aoc-workshop --dry-run --yes

# Custom directory (not empty): warns but proceeds
mkdir filled && touch filled/file.txt && bun run filled --dry-run --yes

# Interactive mode (no --yes, non-empty dir): prompts
mkdir filled && touch filled/file.txt && echo "advent-of-code" | bun run filled
```

---

## Migration Path

1. Create this branch
2. Update context.ts (remove complexity)
3. Rewrite project-name.ts (add all logic)
4. Update type signatures in other actions (only use `cwd` and `projectName`, not `cliArg`)
5. Test all scenarios
6. Merge
