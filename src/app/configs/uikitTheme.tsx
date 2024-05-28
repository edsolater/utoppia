import {
  UIKitThemeConfig,
  cssVar,
  icssClickable,
  icssFrostedGlass,
  icssTextColor,
  parseICSSToClassName
} from "@edsolater/pivkit"

const ButtonStyleIcss = () =>
  parseICSSToClassName([icssFrostedGlass, icssTextColor({ color: cssVar("--ternary") }), icssClickable])

export const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: ButtonStyleIcss,
  },
}
