import {
  Plugin,
  PluginWrapper,
  createDomRef,
  createLazyMemo,
  createPlugin,
  listenDomEvent,
  useKitProps,
  type KitProps,
  type PivProps,
} from "@edsolater/pivkit"
import { createEffect, type Accessor, type JSXElement } from "solid-js"

export type EditablePluginPluginController = {
  isOn: Accessor<boolean>
}

export type EditablePluginPluginOptions = KitProps<{
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isOn?: boolean
  onInput?: (newText: string) => void
}>

//TODO: contenteditable should also be a buildin plugin in `<Text />`
/** special plugin */
export const editablePlugin: Plugin<EditablePluginPluginOptions, EditablePluginPluginController> = createPlugin(
  (kitOptions) => {
    const { props: options } = useKitProps(kitOptions, {
      // defaultProps: isObject(kitOptions) && "isOn" in kitOptions ? undefined : { isOn: true },
    })
    const { dom: selfDom, setDom: setSelfDom } = createDomRef()

    const isOn = createLazyMemo(() => Boolean(options.isOn))

    // make elemet contenteditable
    createEffect(() => {
      const selfEl = selfDom()
      if (!selfEl) return
      const isOn = options.isOn
      if (isOn) {
        selfEl.setAttribute("contenteditable", "plaintext-only")
      } else {
        selfEl.removeAttribute("contenteditable")
      }
    })

    createEffect(() => {
      const selfEl = selfDom()
      if (!selfEl) return
      listenDomEvent(selfEl, "input", ({ ev, el }) => {
        const allText = el.textContent
        options.onInput?.(allText ?? "")
      })
    })

    return { plugin: () => ({ domRef: setSelfDom }) as PivProps, state: { isOn } }
  },
)

/** component version of {@link editablePlugin} */
export function EditablePluginWrapper(
  rawProps: Omit<EditablePluginPluginOptions, "children"> & {
    children?: (state: EditablePluginPluginController) => JSXElement
  },
) {
  return (
    <PluginWrapper plugin={editablePlugin} isOn={rawProps.isOn} onInput={rawProps.onInput}>
      {rawProps.children}
    </PluginWrapper>
  )
}
