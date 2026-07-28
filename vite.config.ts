import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    extensions: [".mjs", ".js", ".ts", ".json"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 1500,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
});
