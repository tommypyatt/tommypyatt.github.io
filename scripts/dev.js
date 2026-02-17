import { spawn } from "child_process";
import chokidar from "chokidar";
import browserSync from "browser-sync";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const DOCS_DIR = path.join(ROOT_DIR, "docs");

let buildProcess = null;
let buildPending = false;

const bs = browserSync.create();

function runBuild() {
  if (buildProcess) {
    buildPending = true;
    return;
  }

  console.log("\n--- Starting build ---\n");

  buildProcess = spawn("node", [path.join(__dirname, "build.js")], {
    cwd: ROOT_DIR,
    stdio: "inherit"
  });

  buildProcess.on("close", (code) => {
    buildProcess = null;

    if (code === 0) {
      console.log("\n--- Build complete ---");
      bs.reload();
    } else {
      console.log("\n--- Build failed ---");
    }

    if (buildPending) {
      buildPending = false;
      runBuild();
    }
  });
}

function startWatcher() {
  console.log("Starting development server...\n");
  console.log("Watching for changes in:");
  console.log("  - content/**/*.md");
  console.log("  - content/images/**/*");
  console.log("  - templates/**/*.ejs");
  console.log("  - src/**/*.css");
  console.log("  - site.config.js");
  console.log("\nPress Ctrl+C to stop.\n");

  // Run initial build
  runBuild();

  // Start browser-sync server
  bs.init({
    server: DOCS_DIR,
    notify: false,
    open: false,
    ui: false
  });

  // Set up file watcher
  const watcher = chokidar.watch(
    [
      path.join(ROOT_DIR, "content", "**", "*.md"),
      path.join(ROOT_DIR, "content", "images", "**", "*.{jpg,jpeg,png,webp,gif}"),
      path.join(ROOT_DIR, "templates", "**", "*.ejs"),
      path.join(ROOT_DIR, "src", "**", "*.css"),
      path.join(ROOT_DIR, "site.config.js")
    ],
    {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    }
  );

  watcher.on("change", (filePath) => {
    console.log(`\nFile changed: ${path.relative(ROOT_DIR, filePath)}`);
    runBuild();
  });

  watcher.on("add", (filePath) => {
    console.log(`\nFile added: ${path.relative(ROOT_DIR, filePath)}`);
    runBuild();
  });

  watcher.on("unlink", (filePath) => {
    console.log(`\nFile removed: ${path.relative(ROOT_DIR, filePath)}`);
    runBuild();
  });
}

startWatcher();
