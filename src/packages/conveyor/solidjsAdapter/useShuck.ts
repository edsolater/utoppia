import { Accessor, Setter, createMemo, createSignal, onCleanup, onMount } from "solid-js"
import { Shuck, makeShuckInvisiable, makeShuckVisiable } from "../smartStore/shuck"
import { createStore, reconcile, type SetStoreFunction } from "solid-js/store"

let globalShuckInstanceSignalID = 1
export function useShuck<T>(shuck: Shuck<T>): [Accessor<T>, Setter<T>] {
  // TODO: if multi has subscribed this shuck, shuck's visiable should depends on multi of them
  const innerID = globalShuckInstanceSignalID++

  const [accessor, set] = createSignal(shuck())

  onMount(() => {
    makeShuckVisiable(shuck, innerID)
    onCleanup(() => {
      makeShuckInvisiable(shuck, innerID)
    })
  })

  shuck.subscribe(set)

  return [accessor, set]
}

export function useShuckAsStore<T extends object>(shuck: Shuck<T>): [T, SetStoreFunction<T>]
export function useShuckAsStore<T extends object | undefined>(
  shuck: Shuck<T>,
  defaultValue: NonNullable<T>,
): [T, SetStoreFunction<T>]
export function useShuckAsStore<T extends object | undefined>(
  shuck: Shuck<T>,
  defaultValue?: NonNullable<T>,
): [T, SetStoreFunction<T>] {
  // TODO: if multi has subscribed this shuck, shuck's visiable should depends on multi of them
  const innerID = globalShuckInstanceSignalID++

  const [store, setStore] = createStore<any>(shuck() ?? defaultValue)

  onMount(() => {
    makeShuckVisiable(shuck, innerID)
    onCleanup(() => {
      makeShuckInvisiable(shuck, innerID)
    })
  })

  shuck.subscribe((i) => {
    setStore(reconcile(i))
  })

  return [store, setStore]
}

/**
 * a shoutcut from {@link useShuck}
 */
export function useShuckValue<T>(shuck: Shuck<T>): Accessor<T>
export function useShuckValue<T, U>(shuck: Shuck<T>, map?: (i: T) => U): Accessor<U>
export function useShuckValue<T, U>(shuck: Shuck<T>, map?: (i: T) => U): Accessor<U | T> {
  const [accessor] = useShuck(shuck)
  if (map) {
    const memo = createMemo(() => map(accessor()))
    return memo
  }
  return accessor
}
