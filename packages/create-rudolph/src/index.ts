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
  projectDir: string;
  projectName: string;
  solutionsDir: string;
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

function isEmpty(dirPath: string): boolean {
  if (!fs.existsSync(dirPath)) return true;
  const safeFiles = new Set([".DS_Store", ".git", ".gitignore", "LICENSE"]);
  const contents = fs.readdirSync(dirPath);
  return contents.every((f) => safeFiles.has(f) || f.startsWith(".git"));
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
// Prompts
// ============================================================================

async function gatherConfig(): Promise<Config> {
  const packageManager = detectPackageManager();
  const currentYear = new Date().getFullYear().toString();

  // Get first positional arg as potential project name
  const argProjectName = process.argv[2];
  const hasArgName = argProjectName && !argProjectName.startsWith("-");

  // 1. Project directory
  let projectDir: string;
  if (hasArgName) {
    projectDir = path.resolve(argProjectName);
    if (!isEmpty(projectDir)) {
      console.log(color.yellow(`Directory "${argProjectName}" is not empty.`));
      const dirName = handleCancel(
        await text({
          message: "Where should we create your project?",
          placeholder: "advent-of-code",
          validate: (v) => (!isEmpty(v) ? "Directory is not empty" : undefined),
        })
      );
      projectDir = path.resolve(dirName);
    }
  } else {
    const dirName = handleCancel(
      await text({
        message: "Where should we create your project?",
        placeholder: "advent-of-code",
        initialValue: "advent-of-code",
        validate: (v) => (!isEmpty(v) ? "Directory is not empty" : undefined),
      })
    );
    projectDir = path.resolve(dirName);
  }

  const projectName = path.basename(projectDir);

  // 2. Solutions directory
  const solutionsDir = handleCancel(
    await text({
      message: "Folder for your daily solutions?",
      placeholder: "solutions",
      initialValue: "solutions",
    })
  );

  // 3. Year
  const year = handleCancel(
    await text({
      message: "Which year are you tackling?",
      placeholder: currentYear,
      initialValue: currentYear,
    })
  );

  // 4. Session cookie
  const wantsSession = handleCancel(
    await confirm({
      message: "Add your AoC session cookie? (needed to download inputs)",
      initialValue: true,
    })
  );

  let session = "";
  if (wantsSession) {
    session = handleCancel(
      await password({
        message: "Paste your session cookie from adventofcode.com:",
      })
    );
  }

  // 5. User agent (optional)
  const wantsUserAgent = handleCancel(
    await confirm({
      message: "Include an email in User-Agent? (optional but polite)",
      initialValue: false,
    })
  );

  let userAgent = "";
  if (wantsUserAgent) {
    userAgent = handleCancel(
      await text({
        message: "Email for User-Agent:",
        placeholder: "you@example.com",
      })
    );
  }

  // 6. Install deps
  const installDeps = handleCancel(
    await confirm({
      message: "Install dependencies?",
      initialValue: true,
    })
  );

  // 7. Init git
  const initGit = handleCancel(
    await confirm({
      message: "Initialize a git repository?",
      initialValue: true,
    })
  );

  return {
    projectDir,
    projectName,
    solutionsDir: solutionsDir.trim() || "solutions",
    year: year.trim() || currentYear,
    session: session.trim(),
    userAgent: userAgent.trim(),
    installDeps,
    initGit,
    packageManager,
  };
}

// ============================================================================
// Scaffolding
// ============================================================================

async function scaffold(config: Config): Promise<void> {
  const { projectDir, projectName, solutionsDir, year, session, userAgent } =
    config;

  // Create directories
  await fs.promises.mkdir(path.join(projectDir, solutionsDir), {
    recursive: true,
  });

  // package.json
  const pkg = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
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

  // .env
  const envLines = [
    `AOC_YEAR=${year}`,
    `OUTPUT_DIR=./${solutionsDir}`,
    session ? `AOC_SESSION=${session}` : "# AOC_SESSION=your_session_here",
    userAgent ? `AOC_USER_AGENT=${userAgent}` : "",
  ].filter(Boolean);
  await fs.promises.writeFile(
    path.join(projectDir, ".env"),
    envLines.join("\n") + "\n"
  );

  // .gitignore
  const gitignore = ["node_modules", ".env", "*.log"].join("\n") + "\n";
  await fs.promises.writeFile(path.join(projectDir, ".gitignore"), gitignore);

  // README
  const readme = `# ${projectName}

My solutions for Advent of Code ${year}.

## Usage

\`\`\`bash
${config.packageManager} run setup      # Prepare today's puzzle
${config.packageManager} run run:sample # Run on sample input
${config.packageManager} run run:input  # Run on real input
\`\`\`
`;
  await fs.promises.writeFile(path.join(projectDir, "README.md"), readme);
}

// ============================================================================
// Post-setup tasks
// ============================================================================

async function runPostSetup(config: Config): Promise<void> {
  const s = spinner();

  if (config.installDeps) {
    s.start("Installing dependencies...");
    try {
      await exec(config.packageManager, ["install"], config.projectDir);
      s.stop("Dependencies installed");
    } catch {
      s.stop(color.yellow("Failed to install dependencies"));
    }
  }

  if (config.initGit) {
    s.start("Initializing git...");
    try {
      await exec("git", ["init"], config.projectDir);
      await exec("git", ["add", "-A"], config.projectDir);
      await exec(
        "git",
        ["commit", "-m", "Initial commit from create-rudolph"],
        config.projectDir
      );
      s.stop("Git initialized");
    } catch {
      s.stop(color.yellow("Failed to initialize git"));
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log();
  intro(color.bgRed(color.white(" rudolph ")) + " 🎄 Let's set up your AoC workspace");

  const config = await gatherConfig();

  const s = spinner();
  s.start("Scaffolding project...");
  await scaffold(config);
  s.stop("Project scaffolded");

  await runPostSetup(config);

  // Next steps
  const relativePath = path.relative(process.cwd(), config.projectDir) || ".";
  const cdCmd = relativePath !== "." ? `cd ${relativePath} && ` : "";

  outro(`Done! Next steps:

  ${color.cyan(`${cdCmd}${config.packageManager} run setup`)}

  Then start coding 🎅`);
}

main().catch(console.error);
