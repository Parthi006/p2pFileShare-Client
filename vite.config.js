// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [react()],
    define: {
    global: "globalThis",
    "process.env": {}, // ✅ Fix: Prevent `process is not defined`
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // fix for `global is not defined`
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
});
