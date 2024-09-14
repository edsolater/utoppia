/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite"
import solidPlugin from "vite-plugin-solid"
import { nodePolyfills } from "vite-plugin-node-polyfills"

export default defineConfig({
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
  server: { port: 3000 },
  define: { "process.env": { NODE_ENV: JSON.stringify(process.env.NODE_ENV) } },
  worker: { format: "es" },
  build: { target: "esnext" },
})
