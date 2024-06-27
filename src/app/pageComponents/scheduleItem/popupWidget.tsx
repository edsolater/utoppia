import { addDefaultProperties } from "@edsolater/fnkit"
import {
  Plugin,
  PopoverPanel,
  createDisclosure,
  createDomRef,
  createPlugin,
  createUUID,
  focusFirstFocusableChild,
  getFirstFocusableChild,
  makeFocusable,
  useClickOutside,
  type PivChild,
} from "@edsolater/pivkit"
import { Show, createEffect, createMemo, on, type Accessor } from "solid-js"

export type PopupWidgetPluginController = {
  isOpen: Accessor<boolean>
  openPopup: () => void
  closePopup: () => void
  togglePopup: () => void
}

/** for {@link PopupDirection} */
type BaseDir = "top" | "bottom" | "left" | "right" | "center"
/** just util for {@link PopupDirection} */
type NoSameDirection<D extends BaseDir> = D extends "top" | "bottom"
  ? "left" | "right"
  : D extends "left" | "right"
    ? "top" | "bottom"
    : never
export type PopupDirection =
  | BaseDir
  | `${BaseDir} ${"center" | NoSameDirection<BaseDir> | `span-${NoSameDirection<BaseDir>}`}`

export type PopupWidgetPluginOptions = {
  /** REQUIRED */
  popElement: (utils: PopupWidgetPluginController) => PivChild

  defaultOpen?: boolean

  //TODO: imply it !!
  open?: boolean

  noStyle?: boolean

  /** user can close popup panel when user click the outside */
  canBackdropClose?: boolean

  /** when open popup, focus on the popup panel's first focusable element child */
  shouldFocusChildWhenOpen?: boolean

  onOpen?: () => void
  onClose?: () => void

  /** usually used for popup/tooltip/dropdown/select */
  popupDirection?: PopupDirection
}

export type PopupWidgetPlugin = Plugin<PopupWidgetPluginOptions>

/** special plugin */
export const popupWidget: PopupWidgetPlugin = createPlugin((opts) => {
  const options = addDefaultProperties(opts, { noStyle: true })
  const uuid = createUUID()
  const { dom: popoverTriggerDom, setDom: setPopoverTriggerDom } = createDomRef()
  const { dom: popoverContentDom, setDom: setPopoverContentDom } = createDomRef()

  const [isOn, { toggle, open, close }] = createDisclosure(options.defaultOpen, {
    onToggle(toOpen) {
      if (toOpen) {
        options.onOpen?.()
      } else {
        options.onClose?.()
      }
    },
  })

  const controller: PopupWidgetPluginController = {
    isOpen: isOn,
    openPopup: open,
    closePopup: close,
    togglePopup: toggle,
  }

  // click outside to close popover
  if (options.canBackdropClose) {
    useClickOutside([popoverContentDom], {
      onClickOutSide: () => {
        if (isOn()) close() // trigger is also outside of the popover
      },
    })
  }

  const gapInfo = createMemo(() => getPanelGapDirection(options.popupDirection ?? "right span-bottom"))

  if (options.shouldFocusChildWhenOpen) {
    createEffect(
      on(isOn, (on) => {
        if (on) {
          focusFirstFocusableChild(popoverContentDom())
        }
      }),
    )
  }

  return () => ({
    domRef: setPopoverTriggerDom,
    icss: {
      // https://developer.chrome.com/blog/anchor-positioning-api?hl=zh-cn
      anchorName: `--pop-anchor-${uuid}`,
    },
    onClick: ({ ev }) => {
      open()
    },
    "render:firSstChild": (
      <Show when={isOn()}>
        <PopoverPanel
          domRef={setPopoverContentDom}
          open={isOn}
          icss={[
            {
              padding: "unset",
              border: "unset",
              background: "unset",
              margin: "unset",

              marginRight: gapInfo().leftHaveGap ? "8px" : undefined,
              marginLeft: gapInfo().rightHaveGap ? "8px" : undefined,
              marginBottom: gapInfo().topHaveGap ? "8px" : undefined,
              marginTop: gapInfo().bottomHaveGap ? "8px" : undefined,

              position: "fixed",
              positionAnchor: `--pop-anchor-${uuid}`,
              // top: "anchor(top)",
              // left: "anchor(left)",
              // right: "anchor(right)",
              // bottom: "anchor(bottom)",
              insetArea: options.popupDirection ?? ("right span-bottom" as PopupDirection),
              positionTryOptions: "flip-block flip-inline",
            },
          ]}
        >
          {options.popElement(controller)}
        </PopoverPanel>
      </Show>
    ),
  })
})

/**
 * get gap from  input direction
 * @param popupDirection
 * @returns gap info
 */
function getPanelGapDirection(popupDirection: PopupDirection): {
  leftHaveGap: boolean
  rightHaveGap: boolean
  topHaveGap: boolean
  bottomHaveGap: boolean
} {
  return {
    topHaveGap: /(?<![\w-])top(?![\w-])/.test(popupDirection),
    bottomHaveGap: /(?<![\w-])bottom(?![\w-])/.test(popupDirection),
    leftHaveGap: /(?<![\w-])left(?![\w-])/.test(popupDirection),
    rightHaveGap: /(?<![\w-])right(?![\w-])/.test(popupDirection),
  }
}
