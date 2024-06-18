import { Plugin, PopoverPanel, createDisclosure, createPlugin, createUUID, type PivChild } from "@edsolater/pivkit"
import { Show } from "solid-js"

export type PopupWidgetPluginOptions = {
  popElement: PivChild
  defaultOpen?: boolean
}

export type PopupWidgetPlugin = Plugin<PopupWidgetPluginOptions>

export const popupWidget: PopupWidgetPlugin = createPlugin((options) => {
  const { id: uuid } = createUUID()
  const [isOn, { toggle, open }] = createDisclosure(options.defaultOpen, {
    onToggle(isOn) {
      if (isOn) {
        console.log("open popup widget")
      } else {
        console.log("close popup widget")
      }
    },
  })
  return () => ({
    icss: {
      // https://developer.chrome.com/blog/anchor-positioning-api?hl=zh-cn
      anchorName: `--pop-anchor-${uuid}`,
    },
    "merge:onClick": ({ ev }) => {
      open()
    },
    "render:firstChild": (
      <Show when={isOn()}>
        <PopoverPanel
          open={isOn}
          icss={{
            position: "fixed",
            positionAnchor: `--pop-anchor-${uuid}`,
            top: "anchor(top)",
            left: "anchor(left)",
            right: "anchor(right)",
            bottom: "anchor(bottom)",
            zIndex: 1000,
          }}
        >
          {options.popElement}
        </PopoverPanel>
      </Show>
    ),
  })
})
