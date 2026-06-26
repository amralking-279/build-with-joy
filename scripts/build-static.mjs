#!/usr/bin/env node
/**
 * Runs the TanStack/Nitro static build used by Capacitor.
 *
 * The Lovable preview sandbox forces a server preset for hosted previews. For
 * the Android/npm build we intentionally run Vite outside that sandbox branch
 * so the explicit Nitro `static` preset in vite.config.ts writes `.output/public`.
 */
import { spawnSync } from "node:child_process";

const env = { ...process.env };
delete env.DEV_SERVER__PROJECT_PATH;
env.LOVABLE_SANDBOX = "0";

console.log("\n▶ Building static web bundle (.output/public)…");
const result = spawnSync("npx", ["vite", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

process.exit(result.status ?? 1);