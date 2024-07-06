import {
  Plugin,
  createDomRef,
  createPlugin,
  listenDomEvent,
  type PivProps
} from "@edsolater/pivkit"
import { createEffect, type Accessor } from "solid-js"

export type EditablePluginPluginController = {
  isOpen: Accessor<boolean>
}

export type EditablePluginPluginOptions = {
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isOn?: boolean
  onInput?: (newText: string) => void
}

export type EditablePluginPlugin = Plugin<EditablePluginPluginOptions>

//TODO: move to pivkit
//TODO: contenteditable should also be a buildin plugin in `<Text />`
/** special plugin */
export const editablePlugin: EditablePluginPlugin = createPlugin((options) => {
  const { dom: selfDom, setDom: setSelfDom } = createDomRef()

  // make elemet contenteditable
  createEffect(() => {
    const selfEl = selfDom()
    if (!selfEl) return
    selfEl.setAttribute("contenteditable", "plaintext-only")
  })

  createEffect(() => {
    const selfEl = selfDom()
    if (!selfEl) return
    listenDomEvent(selfEl, "input", ({ ev, el }) => {
      const allText = el.textContent
      options.onInput?.(allText ?? "")
    })
  })

  return () => ({ domRef: setSelfDom }) as PivProps
})
