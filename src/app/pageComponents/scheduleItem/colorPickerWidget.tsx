import { Plugin, createDisclosure, createDomRef, createPlugin, createUUID, type PivChild } from "@edsolater/pivkit"

export type ColorPickerWidgetPluginOptions = {
  popElement: PivChild
  defaultOpen?: boolean
}

export type ColorPickerWidgetPlugin = Plugin<ColorPickerWidgetPluginOptions>

/**
 * not imply yet
 */
export const colorPickerWidget: ColorPickerWidgetPlugin = createPlugin((options) => {
  const { dom, setDom } = createDomRef<HTMLInputElement>()
  const uuid = createUUID()

  let htmlColorPicker: HTMLInputElement | null = null

  function popColorPicker() {
    const anchorElement = dom()
    if (!anchorElement) {
      console.error("anchor element is not ready")
      return
    } else {
      anchorElement.style.position = "relative"
    }
    const newHTMLColorPickerInput = document.createElement("input")
    newHTMLColorPickerInput.type = "color"
    // newHTMLColorPickerInput.style.position = "fixed"
    htmlColorPicker = newHTMLColorPickerInput
    anchorElement.appendChild(newHTMLColorPickerInput)
    setTimeout(() => {
      newHTMLColorPickerInput.showPicker()
    }, 10)
  }
  function closeColorPicker() {
    if (htmlColorPicker) {
      htmlColorPicker.remove()
    }
  }

  const [isOn, { toggle, open }] = createDisclosure(options.defaultOpen, {
    onToggle(toOpen) {
      if (toOpen) {
        popColorPicker()
      } else {
        // closeColorPicker()
      }
    },
  })
  return () => ({
    domRef: setDom,
    "merge:onClick": ({ ev }) => {
      toggle()
    },
  })
})
