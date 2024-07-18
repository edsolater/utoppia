import { shrinkFn, type AnyFn } from "@edsolater/fnkit"
import type { Accessify, ElementRefs } from "@edsolater/pivkit"
import { createDisclosure } from "@edsolater/pivkit"
import { getElementFromRefs, listenDomEvent, useGestureHover } from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, onCleanup, type Accessor } from "solid-js"
import { useHoveredDocumentEdge } from "./useHoveredDocumentEdge"

type AutoCloseIfNotInterestOptions = {
  el: ElementRefs
  floatingEdge: Accessify<"top" | "right" | "bottom" | "left">
  enabled?: boolean | Accessify<boolean>
  onClose?: AnyFn
  onOpen?: AnyFn
  /**
   * @default 200
   */
  delay?: number
}

export function usePanelFloatingMaster(options: AutoCloseIfNotInterestOptions) {
  const [isPanelOpened, { close, open }] = createDisclosure(false, {
    onClose() {
      // console.log("onClose")
      options.onClose?.()
    },
    onOpen() {
      // console.log("onOpen")
      options.onOpen?.()
    },
  })
  const { isHover: isHoveringEl } = useGestureHover({ el: options.el })
  const { isInterested } = useIsElementInterestedChecker({ el: options.el })
  const { hoveredEdge } = useHoveredDocumentEdge()
  const isHoveringEdge = createMemo(() => hoveredEdge() === shrinkFn(options.floatingEdge))

  createEffect(() => {
    const enabled = "enabled" in options ? shrinkFn(options.enabled) : true
    if (!enabled) return
    if (!isHoveringEl() && !isInterested() && !isHoveringEdge()) {
      const { cancel } = close({ delay: options.delay ?? 200 })
      onCleanup(cancel)
    } else {
      const { cancel } = open()
      onCleanup(cancel)
    }
  })
}

type ElementInterestedCheckerOptions = {
  el: ElementRefs
  enabled?: boolean | Accessify<boolean>
  action?: AnyFn
}
/**
 * check if the element is interested
 */
export function useIsElementInterestedChecker(options: ElementInterestedCheckerOptions): {
  isInterested: Accessor<boolean>
} {
  const [isInterested, setIsInterested] = createSignal(false)

  createEffect(() => {
    const els = getElementFromRefs(options.el)
    if (!els.length) return
    const enable = "enabled" in options ? shrinkFn(options.enabled) : true
    if (!enable) return
    els.forEach((el) => {
      const { cancel: cancel1 } = listenDomEvent(el, "focusin", () => {
        setIsInterested(true)
      })
      onCleanup(cancel1)
      const { cancel: cancel2 } = listenDomEvent(el, "focusout", () => {
        setIsInterested(false)
      })
      onCleanup(cancel2)
    })
  })

  return {
    isInterested,
  }
}
