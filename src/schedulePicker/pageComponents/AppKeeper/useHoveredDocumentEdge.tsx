import { createSubscribable, type AnyFn } from "@edsolater/fnkit"
import { listenDomEvent } from "@edsolater/pivkit"
import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js"

type Side = "top" | "right" | "bottom" | "left" | undefined
type CallbackFunction = (payloads: { side: Side }) => void
let cleanListenerFn: AnyFn | undefined

const registedCallbacks = createSubscribable<CallbackFunction[]>([])

registedCallbacks.subscribe((a, prevA) => {
  if (a.length === 0) {
    cleanListenerFn?.()
  } else if (a.length === 1 && prevA && prevA.length === 0) {
    const { cancel } = listenDomEvent(globalThis.document, "pointermove", (cev) => {
      const { clientX, clientY } = cev.ev
      const { innerWidth, innerHeight } = window
      const edge = (() => {
        if (clientX < 16) return "left"
        if (clientX > innerWidth - 16) return "right"
        if (clientY < 16) return "top"
        if (clientY > innerHeight - 16) return "bottom"
        return undefined
      })()
      registedCallbacks().forEach((cb) => cb({ side: edge }))
    })
    cleanListenerFn = cancel
  }
})

function addGlobalPointerMoveDetector(cb: CallbackFunction): { remove: () => void } {
  registedCallbacks.set((a) => [...a, cb])
  return {
    remove: () => {
      const index = registedCallbacks().indexOf(cb)
      if (index !== -1) {
        registedCallbacks.set((a) => a.toSpliced(index, 1))
      }
    },
  }
}

// is it more strightforward to be `useDocumentContext()` instead of `useHoveredDocumentEdge`?
export function useHoveredDocumentEdge(): { hoveredEdge: Accessor<"top" | "right" | "bottom" | "left" | undefined> } {
  const [hoveredEdge, setHoveredEdge] = createSignal<"top" | "right" | "bottom" | "left">()
  createEffect(() => {
    const { remove } = addGlobalPointerMoveDetector(({ side: edge }) => {
      setHoveredEdge(edge)
    })
    onCleanup(() => {
      remove()
    })
  })
  return { hoveredEdge }
}
