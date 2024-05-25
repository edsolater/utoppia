import { KeybordShortcutKeys } from "@edsolater/pivkit"
import { homeRoutePath, playgroundRoutePath } from "./routes"

export const globalRouteShortcuts = {
  "go to home": {
    shortcut: "alt + /",
    to: homeRoutePath,
  },
  "go to playgound": {
    shortcut: "alt + p",
    to: playgroundRoutePath,
  },
} satisfies Record<string, { to: string; shortcut: KeybordShortcutKeys }>
