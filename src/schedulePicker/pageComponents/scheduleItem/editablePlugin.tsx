import {
  Plugin,
  PluginWrapper,
  createDomRef,
  createPlugin,
  createSyncSignal,
  cssOpacity,
  useClickOutside,
  useDOMEventListener,
  useKitProps,
  type KitProps,
  type PivProps,
} from "@edsolater/pivkit"
import { createEffect, type Accessor, type JSXElement } from "solid-js"

export type EditablePluginPluginController = {
  isEnabled: Accessor<boolean>
}

export type EditablePluginOptions = {
  /** for debug */
  debugName?: string
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isEnabled?: boolean
  /** with onEnabledChange, it will be a two-way binding */
  onEnabledChange?: (isEnabled: boolean) => void
  /** when innerText is empty. placeholderText will always has .4 opacity */
  placeholder?: string
  onInput?: (newText: string) => void
  onEnter?: (newText: string) => void
  /**
   * use click outside
   * @default true
   */
  endEditWhenClickOutside?: boolean
  /**
   * start edit when click
   * @default true
   */
  startEditWhenClick?: boolean
  /**
   * use more strightforward enter to
   * @default true
   */
  okWhenTypeEnter?: boolean
  /** init cursor position
   * @default "end"
   */
  initEditCursorPlacement?: "start" | "end"
}

export type EditablePluginKitOptions = KitProps<EditablePluginOptions>

//TODO: contenteditable should also be a buildin plugin in `<Text />`
/** special plugin */
export const editablePlugin: Plugin<EditablePluginKitOptions, EditablePluginPluginController> = createPlugin(
  (kitOptions) => {
    const { props: options } = useKitProps(kitOptions, {
      defaultProps: {
        startEditWhenClick: true,
        endEditWhenClickOutside: true,
        okWhenTypeEnter: true,
        initEditCursorPlacement: "end",
      },
    })
    const { dom: selfDom, setDom: setSelfDom } = createDomRef()

    const [isEnabled, setIsEnabled] = createSyncSignal({
      value: () => Boolean(options.isEnabled),
      onSet(value) {
        options.onEnabledChange?.(value)
      },
    })

    useDOMEventListener(selfDom, "click", () => {
      if (options.startEditWhenClick) {
        setIsEnabled(true)
      }
    })

    // make element focus when enabled
    createEffect(() => {
      const selfEl = selfDom()
      if (!selfEl) return
      // make elemet contenteditable
      selfEl.setAttribute("contenteditable", "plaintext-only")

      if (isEnabled()) {
        // Focus the element to ensure that the selection is visible
        selfEl.setAttribute("tabindex", "0")
        selfEl.focus()
      } else {
        selfEl.removeAttribute("tabindex")
        selfEl.blur()
      }
      //if hasn's cursor , then mannually set cursor
      if (!hasCursor()) {
        const initEditCursorPlacement = options.initEditCursorPlacement // default to "end"

        // Create a new range
        const range = document.createRange()
        const selection = window.getSelection()
        if (!selection) return

        // Attempt to find a text node within selfEl
        let textNode = null as Text | null
        let position: number = 0
        if (initEditCursorPlacement === "end") {
          for (const child of selfEl.childNodes) {
            if (isDomNodeTextNode(child)) {
              textNode = child
              position = textNode.length // End of the text node
              break
            }
          }
        }

        if (textNode) {
          // If a text node is found, set the range start to the text node with the determined position
          range.setStart(textNode, position)
        } else {
          // If no text node is found and the cursor is set to start, fall back to setting the range on selfEl
          // This is a fallback and may not always result in visible cursor if selfEl has no text content
          range.setStart(selfEl, 0)
        }

        range.collapse(true) // Collapse the range to the start position to move the cursor
        selection.removeAllRanges()
        selection.addRange(range)
      }
    })

    useDOMEventListener(selfDom, "input", ({ el }) => {
      const allText = el.textContent
      options.onInput?.(allText ?? "")
    })

    if (options.endEditWhenClickOutside) {
      useClickOutside(selfDom, {
        enabled: isEnabled,
        onClickOutSide: () => {
          setIsEnabled(false)
        },
      })
    }

    useDOMEventListener(selfDom, "keydown", ({ ev }) => {
      if (ev.key === "Enter") {
        // handle enter
        if (options.onEnter) {
          options.onEnter?.(selfDom()?.textContent ?? "")
        }

        // if okWhenTypeEnter, then disable
        if (options.okWhenTypeEnter) {
          setIsEnabled(false)
        }
      }
    })

    return {
      plugin: () =>
        ({
          domRef: (el) => {
            if (options.debugName) {
              console.log("el: ", el, options.debugName)
            }
            return setSelfDom(el)
          },
          htmlProps: {
            "data-placeholder": options.placeholder,
          },
          icss: () => ({
            "&:empty": {
              color: cssOpacity("currentColor", 0.4),
              "&::before": {
                content: "attr(data-placeholder)",
              },
            },
          }),
        }) as PivProps,
      state: { isEnabled },
    }
  },
)

/** component version of {@link editablePlugin} */
export function EditablePluginWrapper(
  rawProps: Omit<EditablePluginKitOptions, "children"> & {
    children?: (state: EditablePluginPluginController) => JSXElement
  },
) {
  return (
    <PluginWrapper plugin={editablePlugin} isEnabled={rawProps.isEnabled} onInput={rawProps.onInput}>
      {rawProps.children}
    </PluginWrapper>
  )
}

function isDomNodeTextNode(node: Node): node is Text {
  return node.nodeType === Node.TEXT_NODE
}

/**
 * document has cursor
 */
function hasCursor() {
  const selection = window.getSelection()
  if (!selection) return false
  return selection.rangeCount > 0
}
