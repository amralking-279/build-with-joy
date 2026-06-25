#!/usr/bin/env node
/**
 * Mobile (Capacitor) build helper.
 *
 * TanStack Start (with the Nitro Cloudflare preset shipped by
 * @lovable.dev/vite-tanstack-config) emits:
 *   - dist/client/   → static assets (NO index.html — SSR renders HTML)
 *   - dist/server/   → Worker bundle, entry = dist/server/index.mjs
 *
 * Capacitor needs a plain static folder with index.html. We:
 *   1) Run `vite build`.
 *   2) Import the built Worker entry (dist/server/index.mjs) in Node and
 *      call its fetch() with the `X-TSS_SHELL` header so TanStack Start
 *      returns the SPA shell HTML.
 *   3) Write that HTML to dist/client/index.html.
 *   4) Optionally run `npx cap sync android`.
 */
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const run = (cmd, args) => {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (res.status !== 0) process.exit(res.status ?? 1);
};

console.log("\n▶ Building web bundle (vite build)…");
run("npx", ["vite", "build"]);

// Locate the built Worker entry. Current TanStack Start + Nitro layout puts
// the fetch handler at dist/server/index.mjs. Fall back to legacy paths just
// in case the upstream layout changes again.
const candidates = [
  "dist/server/index.mjs",
  "dist/server/_worker.js",
  "dist/server/_ssr/ssr.mjs",
];
const ssrEntry = candidates.map((p) => resolve(root, p)).find((p) => existsSync(p));
if (!ssrEntry) {
  console.error("\n✖ SSR bundle not found. Checked:");
  for (const p of candidates) console.error("   - " + p);
  process.exit(1);
}
console.log(`▶ Using SSR entry: ${ssrEntry}`);

console.log("\n▶ Prerendering SPA shell (dist/client/index.html)…");
process.env.TSS_SHELL = "true";
const mod = await import(pathToFileURL(ssrEntry).href);
const handler = mod.default ?? mod;
if (typeof handler?.fetch !== "function") {
  console.error("✖ SSR entry does not export a fetch() handler.");
  process.exit(1);
}

// Cloudflare-style ExecutionContext stub (the Worker bundle calls
// ctx.waitUntil — passing undefined crashes augmentReq()).
const execCtx = {
  waitUntil: (_promise) => {},
  passThroughOnException: () => {},
};

const request = new Request("http://localhost/", {
  headers: { "X-TSS_SHELL": "true" },
});
const response = await handler.fetch(request, {}, execCtx);
if (!response.ok) {
  console.error(`✖ Shell render failed: HTTP ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}
const html = await response.text();
const outPath = resolve(root, "dist/client/index.html");
writeFileSync(outPath, html);
console.log(`✔ Wrote ${outPath} (${html.length} bytes)`);

const shouldSync =
  process.argv.includes("--sync") ||
  (process.argv.includes("--sync-if-android") && existsSync(resolve(root, "android")));

if (shouldSync) {
  console.log("\n▶ Syncing Capacitor (android)…");
  run("npx", ["cap", "sync", "android"]);
}

console.log("\n✅ Mobile build ready. webDir = dist/client");
