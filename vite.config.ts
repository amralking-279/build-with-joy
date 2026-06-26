import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  nitro: {
    preset: "static",
    entry: "./scripts/nitro-static-entry.mjs",
    output: {
      dir: ".output",
      publicDir: ".output/public",
    },
  },
  tanstackStart: {
    server: { entry: "server" },
    spa: {
      enabled: true,
      maskPath: "/",
      prerender: {
        outputPath: "/",
        crawlLinks: false,
      },
    },
  },
  vite: {
    optimizeDeps: {
      include: [
        '@capacitor/core',
        '@capacitor/local-notifications',
        '@capacitor/app',
        '@capacitor/splash-screen',
        '@capacitor/browser',
        '@capacitor/filesystem',
        '@capacitor/app-launcher',
      ],
    },
  },
});
