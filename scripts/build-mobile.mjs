#!/usr/bin/env node
/**
 * Mobile (Capacitor) build helper.
 *
 * TanStack Start always produces a Cloudflare Worker (SSR) build —
 * `dist/client/` holds the static client assets but no `index.html`,
 * because in production the Worker renders HTML at request time.
 *
 * Capacitor needs a plain static folder with an `index.html` entry point.
 * To produce that, we:
 *   1. Run the normal `vite build` (which creates `dist/client` + `dist/server`).
 *   2. Import the built SSR bundle (`dist/server/_ssr/ssr.mjs`) directly in
 *      Node and call its `fetch()` with the `X-TSS_SHELL: true` header.
 *      TanStack Start recognises this header and returns the **SPA shell** —
 *      a single HTML document that hydrates client-side and lets the
 *      client router take over (perfect for a WebView).
 *   3. Write that HTML to `dist/client/index.html`.
 *   4. Run `npx cap sync android` so Capacitor copies `dist/client/` (the
 *      configured `webDir`) into the native Android project.
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

const ssrEntry = resolve(root, "dist/server/_ssr/ssr.mjs");
if (!existsSync(ssrEntry)) {
  console.error(`\n✖ SSR bundle not found at ${ssrEntry}`);
  console.error("  The vite build did not produce the expected output layout.");
  process.exit(1);
}

console.log("\n▶ Prerendering SPA shell (dist/client/index.html)…");
process.env.TSS_SHELL = "true";
const mod = await import(pathToFileURL(ssrEntry).href);
const handler = mod.default ?? mod;
const request = new Request("http://localhost/", {
  headers: { "X-TSS_SHELL": "true" },
});
const response = await handler.fetch(request, {}, {});
if (!response.ok) {
  console.error(`✖ Shell render failed: HTTP ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}
const html = await response.text();
const outPath = resolve(root, "dist/client/index.html");
writeFileSync(outPath, html);
console.log(`✔ Wrote ${outPath} (${html.length} bytes)`);

if (process.argv.includes("--sync")) {
  console.log("\n▶ Syncing Capacitor (android)…");
  run("npx", ["cap", "sync", "android"]);
}

console.log("\n✅ Mobile build ready. webDir = dist/client");
