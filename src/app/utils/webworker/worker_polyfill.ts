import { Buffer } from "buffer"

if (typeof globalThis !== "undefined" && globalThis.Buffer === undefined) {
  globalThis.Buffer = Buffer
}
