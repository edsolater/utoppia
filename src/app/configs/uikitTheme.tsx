import { UIKitThemeConfig, cssVar, icssClickable, icssFrostedGlass, icssTextColor } from "@edsolater/pivkit"

export const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: [icssFrostedGlass, icssTextColor({ color: cssVar("--ternary") }), icssClickable],
  },
}
