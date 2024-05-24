import { cssDarken } from "@edsolater/pivkit"
import { cssOpacity, cssVar } from "@edsolater/pivkit"

/** define in [app](./app.css) */
// https://edsolaters.notion.site/f491339a26f3480f804bda4e1d7ece7d
export const colors = {
  // base color
  transparent: "transparent",

  // app main bg color
  primary: "#abc4ff",
  secondary: "#22D1F8",
  secondary10: "rgba(34, 209, 248, 0.1)",

  backgroundDark: "#0b1022",
  backgroundDark50: "#0b102280",
  backgroundMedium: "#161E32",
  backgroundLight: "#1C243E",
  backgroundLight50: "#1C243E88",
  backgroundLight30: "#1C243E4d",
  backgroundTransparent12: "rgba(171, 196, 255, 0.12)",
  backgroundTransparent07: "rgba(171, 196, 255, 0.07)",
  backgroundTransparent10: "rgba(171, 196, 255, 0.1)",

  // component color

  appPanelBg: "#131a35",

  // text
  textPrimary: cssVar("--text-primary"),
  textSecondary: cssVar("--text-secondary"),
  textTertiary: cssVar("--text-tertiary"),
  textRevertPrimary: cssVar("--text-revert-primary"),
  textLink: cssVar("--text-link"),

  /* list */
  listItemBg: cssVar("--list-item-bg"),
  listHeaderBg: cssOpacity(cssVar("--list-item-bg"), 0.2),

  /** 🤔 what's this */
  textQuaternary: "#C4D6FF",
  /** 🤔 what's this */
  textQuinary: "#1C243E",
  /** 🤔 what's this */
  textSenary: "rgba(196, 214, 255, 0.5)",
  /** 🤔 what's this */
  textSeptenary: "#22D1F8",
  /** 🤔 what's this */
  textPurple: "#8C6EEF",
  /** 🤔 what's this */
  textPink: "#FF4EA3",

  // button
  buttonPrimary: "#22D1F8",
  buttonPrimary__01: "#22D1F8",
  buttonPrimary__02: "#39D0D8",
  buttonSolidText: "#0B1022",
  buttonSecondary: "#8C6EEF",

  // switch
  switchOn: "#22D1F8",
  switchOff: "#abc4ff80",

  // select
  selectActive: "#abc4ff",
  selectActiveSecondary: "#22D1F8",
  selectInactive: "#abc4ff1a",

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

  // Icon
  iconBg: "#8CA7E8",
  iconEmptyStroke: "#0B1022",

  // success/warning/error/info
  semanticSuccess: "#22D1F8",
  semanticError: "#FF4EA3",
  semanticWarning: "#FED33A",
  semanticNeutral: "#ABC4FF",
  semanticFocus: "#A259FF",

  // Tab
  tabFolderTabListBg: "var(--background-light-opacity)",

  // Step
  stepActiveBg: "var(--background-light)",
  stepHoofBg: "var(--primary)",

  // +1% is priceFloatingUp; -1% is priceFloatingDown
  priceFloatingUp: "#22D1F8",
  priceFloatingDown: "#FF4EA3",
  priceFloatingFlat: "#888888",

  // tooltip (this color is not in figma ui color system,but in figma ui page)
  tooltipBg: "#0D1A3E",

  popoverBg: "#141f3a",

  //customize (by V3 frontend coder)
  scrollbarThumb: "rgba(255, 255, 255, 0.4)",

  // badge
  badgePurple: "rgba(140, 110, 239, 0.5)",
  badgeBlue: "rgba(34, 209, 248, 0.5)",

  // divider
  dividerBg: "rgba(171, 196, 255, 0.12)",

  // input
  inputMask: "#0B102266",

  // customize (by V3 frontend coder)
  backgroundApp:
    "linear-gradient(29.71deg, #121C34 -18.98%, #050D17 14.6%, #070A15 56.26%, rgba(9, 14, 29, 0.97) 85.27%)",
  solidButtonBg: "linear-gradient(272.03deg, #39D0D8 2.63%, #22D1F8 95.31%)",
  outlineButtonBg: "linear-gradient(272.03deg, rgba(57, 208, 216, 0.1) 2.63%, rgba(34, 209, 248, 0.1) 95.31%)",
  filledProgressBg: "linear-gradient(270deg, #8C6EEF 0%, #4F53F3 100%)",
  transparentContainerBg: "linear-gradient(271.31deg, rgba(96, 59, 200, 0.2) 1.47%, rgba(140, 110, 239, 0.12) 100%)",
  /** it's designer's variable name in Figma */
  brandGradient: "linear-gradient(244deg, #7748FC 8.17%, #39D0D8 101.65%)",
  dividerDashGradient: "repeating-linear-gradient(to right, currentColor 0 5px, transparent 5px 10px)",

  tokenAvatarBg: "linear-gradient(127deg, rgba(171, 196, 255, 0.20) 28.69%, rgba(171, 196, 255, 0.00) 100%) #0b102280",

  panelCardShadow: "0px 8px 24px rgba(79, 83, 243, 0.12)",
  panelCardBorder: "unset",
  panelCardBg: cssDarken('#abc4ff',.5)
}
