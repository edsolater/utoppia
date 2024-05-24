import { shrinkFn, type AnyFn } from "@edsolater/fnkit";
import type { Accessify } from "@edsolater/pivkit";
import { createEffect, onCleanup } from "solid-js";
import { useHoveredDocumentEdge } from "./useHoveredDocumentEdge";

type DocumentEdgeOpenOptions = {
  enabled?: boolean | Accessify<boolean>;
  floatingEdge: Accessify<"top" | "right" | "bottom" | "left">;
  onClose?: AnyFn;
  onOpen?: AnyFn;
  /**
   * @default 200
   */
  delay?: number;
};

export function useDocumentEdgeOpen(options: DocumentEdgeOpenOptions) {
  // fast open
  const { hoveredEdge } = useHoveredDocumentEdge();
  createEffect(() => {
    const enabled = "enabled" in options ? shrinkFn(options.enabled) : true;
    if (!enabled) return;
    const hoveredEdgeValue = hoveredEdge();
    const floatingEdgeValue = shrinkFn(options.floatingEdge);
    const timeId = setTimeout(() => {
      if (hoveredEdgeValue === floatingEdgeValue) {
        options.onOpen?.();
      } else {
        options.onClose?.();
      }
    }, options.delay ?? 200);
    onCleanup(() => {
      clearTimeout(timeId);
    });
  });
}
