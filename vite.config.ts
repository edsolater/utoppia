/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
  optimizeDeps: {
    // include: ['@edsolater/fnkit', '@raydium-io/raydium-sdk'],
    exclude: ["@edsolater/fnkit", "@edsolater/pivkit"],
  },
  plugins: [
    solidPlugin(),
    nodePolyfills(),
    // your plugins,
    // https://github.com/vitejs/vite/issues/3033#issuecomment-1360691044
    {
      name: "singleHMR",
      handleHotUpdate({ modules }) {
        modules.map((m) => {
          m.importers = new Set()
        })

        return modules
      },
    },
  ],
  server: {
    port: 3000,
  },
  // resolve: {
  //   conditions: ['development', 'browser'],
  // },
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  },
  worker: {
    format: "es",
  },
  // test: {
  //   environment: 'jsdom',
  //   globals: true,
  //   transformMode: { web: [/\.[jt]sx?$/] },
  //   setupFiles: ['node_modules/@testing-library/jest-dom/extend-expect.js'],
  //   // otherwise, solid would be loaded twice:
  //   deps: { registerNodeLoader: true },
  //   // if you have few tests, try commenting one
  //   // or both out to improve performance:
  //   threads: false,
  //   isolate: false,
  // },
  build: {
    target: "esnext",
  },
})
