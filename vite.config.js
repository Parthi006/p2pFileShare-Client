// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

export default defineConfig({
  plugins: [react()],
    define: {
    global: "globalThis",
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || "https://p2pfileshare-server.onrender.com"),
    },
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
