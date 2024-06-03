import { UIKitThemeConfig, icssClickable, icssNewCompositedLayer, parseICSSToClassName } from "@edsolater/pivkit"

const ButtonStyleIcss = () => parseICSSToClassName([icssClickable, icssNewCompositedLayer])

export const uikitConfig: UIKitThemeConfig = {
  Button: { icss: ButtonStyleIcss },
}
