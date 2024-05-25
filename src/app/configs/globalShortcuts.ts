import { KeybordShortcutKeys } from "@edsolater/pivkit";
import { routeItems } from "./routes";

export const globalRouteShortcuts = {
  "go to home": {
    shortcut: "alt + /",
    to: routeItems.home.path,
  },
  "go to playgound": {
    shortcut: "alt + p",
    to: routeItems.playground.path,
  },
} satisfies Record<string, { to: string; shortcut: KeybordShortcutKeys }>
