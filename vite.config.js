// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import rollupNodePolyFill from "rollup-plugin-node-polyfills";

export default defineConfig({
  plugins: [react()],
    define: {
    global: "globalThis",
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis", // fix for `global is not defined`
        "process.env.NODE_ENV": JSON.stringify("production"),
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
    },
  },
  build : {
    rollupOptions : {
      plugins: [rollupNodePolyFill()]
    }
  }
});
