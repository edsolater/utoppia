import { shrinkFn } from "@edsolater/fnkit"
import { createDomRef, createPlugin, useKitProps, type KitProps, type PivProps, type Plugin } from "@edsolater/pivkit"
import { createEffect, type Accessor } from "solid-js"

export type visiblePluginPluginController = {
  isOn: Accessor<boolean>
}

export type visiblePluginPluginOptions = KitProps<{
  /**
   * directly can type , or only type when js callback was trigger.
   * usually, u should pass a accessor as a signal
   **/
  isOn?: boolean
  onChange?: (newText: string) => void
}>

export type visiblePluginPlugin = Plugin<visiblePluginPluginOptions>

/** special plugin */
export const visiblePlugin: visiblePluginPlugin = createPlugin(
  (opts) => {
    const { props: options } = useKitProps(opts)
    const { dom: selfDom, setDom: setSelfDom } = createDomRef()
    return () =>
      {
        const isOnnn = shrinkFn(opts.isOn)
        createEffect(() => {
          console.log('isOnnn: ', isOnnn)
        })
        return ({
          domRef: setSelfDom,
          get icss() {
            return { visibility: shrinkFn(opts.isOn) ? "visible" : "hidden" }
          },
        }) as PivProps
      }
  },
  { name: "visiblePlugin" },
)
