import { KeybordShortcutKeys } from "@edsolater/pivkit"
import { clmmRoutePath, farmsRoutePath, homeRoutePath, poolsRoutePath, swapRoutePath } from "./routes"

export const globalRouteShortcuts = {
  "go to home": {
    shortcut: "alt + /",
    to: homeRoutePath,
  },
  "go to swap": {
    shortcut: "alt + s",
    to: swapRoutePath,
  },
  "go to pools": {
    shortcut: "alt + p",
    to: poolsRoutePath,
  },
  "go to farms": {
    shortcut: "alt + f",
    to: farmsRoutePath,
  },
  "go to clmm": {
    shortcut: "alt + c",
    to: clmmRoutePath,
  },
} satisfies Record<string, { to: string; shortcut: KeybordShortcutKeys }>
