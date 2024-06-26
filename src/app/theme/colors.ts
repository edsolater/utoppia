import { cssOpacity, cssVar } from "@edsolater/pivkit"

/** define in [app](./app.css) */
// https://edsolaters.notion.site/f491339a26f3480f804bda4e1d7ece7d
export const colors = {
  // base color
  transparent: "transparent",

  /** @deprecated this is only for temp use*/
  primary: cssVar("--primary"),
  /** @deprecated this is only for temp use*/
  secondary: cssVar("--secondary"),
  /** @deprecated this is only for temp use*/
  ternary: cssVar("--ternary"),

  backgroundDark50: "#0b102280",
  backgroundMedium: "#161E32",
  backgroundLight: "#1C243E",
  backgroundLight50: "#1C243E88",
  backgroundLight30: "#1C243E4d",
  backgroundTransparent12: "rgba(171, 196, 255, 0.12)",
  backgroundTransparent07: "rgba(171, 196, 255, 0.07)",
  backgroundTransparent10: "rgba(171, 196, 255, 0.1)",

  // component color
  appPanel: cssVar("--app-panel-bg"),
  appMainContent__01: cssVar("--app-main-bg__01"),
  appMainContent__02: cssVar("--app-main-bg__02"),

  // text
  textPrimary: cssVar("--text-primary"),
  textSecondary: cssVar("--text-secondary"),
  textTernary: cssVar("--text-ternary"),
  textRevertPrimary: cssVar("--text-revert-primary"),

  /* list */
  listItem: cssVar("--list-item-bg"),
  listHeader: cssOpacity(cssVar("--list-item-bg"), 0.2),

  // button
  buttonPrimary: "#22D1F8",
  buttonSecondary: "#8C6EEF",
  buttonSolidText: "#0B1022",

  card: cssVar("--card-bg"),

  // chart
  chart01: "#abc4ff",
  chart02: "#39D0D8",
  chart03: "#8C6EEF",
  chart04: "#2B6AFF",
  chart05: "#FF7043",
  chart06: "#FED33A",
  chart07: "#4F53F3",
  chart08: "#22D1F8",
  chart09: "#8C6EEF33",

  // success/warning/error/info
  semanticSuccess: "#22D1F8",
  semanticError: "#FF4EA3",
  semanticWarning: "#FED33A",
  semanticNeutral: "#ABC4FF",
  semanticFocus: "#A259FF",
}

