import {
  UIKitThemeConfig,
  cssVar,
  icssClickable,
  icssFrostedGlass,
  icssNewCompositedLayer,
  icssTextColor,
  parseICSSToClassName,
} from "@edsolater/pivkit"

const ButtonStyleIcss = () =>
  parseICSSToClassName([
    icssFrostedGlass,
    icssTextColor({ color: cssVar("--ternary") }),
    icssClickable,
    icssNewCompositedLayer,
  ])

export const uikitConfig: UIKitThemeConfig = {
  Button: {
    icss: ButtonStyleIcss,
  },
}
