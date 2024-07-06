import { Plugin, createDomRef, createPlugin, listenDomEvent, useKitProps, type PivProps } from "@edsolater/pivkit"
import { createEffect, type Accessor } from "solid-js"

export type visiblePluginPluginController = {
  isOn: Accessor<boolean>
}

export type visiblePluginPluginOptions = {
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isOn?: boolean
  onChange?: (newText: string) => void
}

export type visiblePluginPlugin = Plugin<visiblePluginPluginOptions>

/** special plugin */
export const visiblePlugin: visiblePluginPlugin = createPlugin((opts) => {
  const { props: options, shadowProps } = useKitProps(opts, { name: "[plugin] visiblePlugin" })
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
      options.onChange?.(allText ?? "")
    })
  })

  return () => ({ domRef: setSelfDom, shadowProps }) as PivProps
})
