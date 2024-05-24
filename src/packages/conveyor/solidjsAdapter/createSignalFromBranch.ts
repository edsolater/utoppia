import { Accessor, createSignal } from "solid-js"
import { Branch } from "../smartStore/branch"
import { Shuck } from "../smartStore/shuck"
import { shrinkFn } from "@edsolater/fnkit"

export function createSignalFromBranch<T extends object, U>(
  branch: Branch<T>,
  get: (store: Branch<T>) => Shuck<U>,
): [Accessor<U>, SetFn<U>] {
  const leaf = get(branch)
  const [accessor, set] = createSignal(leaf())
  // this set may affect to leaf also
  const linkedSet: SetFn<U> = (dispatcher) => {
    const currentValue = leaf()
    const newValue = shrinkFn(dispatcher, [currentValue])
    set(() => newValue)
  }
  return [accessor, linkedSet]
}
/** a simple replace of solidjs' Setter, for it is too complicated */
type SetFn<T> = (dispatcher: T | ((prev: T) => T)) => void
