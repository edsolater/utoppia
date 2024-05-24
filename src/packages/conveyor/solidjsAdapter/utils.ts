import { Accessor, createEffect, createSignal, on, Setter } from "solid-js"
import { Shuck } from "../smartStore/shuck"

/**
 * subscribable to [accessor, setter]
 */
export function useLeaf<T>(subscribable: Shuck<T>): [Accessor<T>, Setter<T>] {
  const defaultValue = subscribable()
  const [accessor, setter] = createSignal(defaultValue)

  createEffect(
    on(accessor, (v) => {
      subscribable.set(v)
    }),
  )

  return [accessor, setter]
}
