import { isFunction, shrinkFn } from "@edsolater/fnkit"
import { Accessor, createEffect, untrack } from "solid-js"
import { createStore as _createStore, unwrap } from "solid-js/store"
import { Branch, createBranchStore } from "../../smartStore/branch"
import { createStoreSetter } from "./utils/setStoreByObject"

export type CreateSmartStoreOptions_BasicOptions<T extends Record<string, any>> = {}
export type CreateSmartStoreOptions<T extends Record<string, any>> = CreateSmartStoreOptions_BasicOptions<T>

export type SmartSetStore<T extends Record<string, any>> = (
  dispatch: ((prevStore?: T) => Partial<T>) | Partial<T>,
) => void

export type SmartStore<T extends Record<string, any>> = {
  store: T
  /** new object will merge to original   */
  setStore: SmartSetStore<T>

  branchStore: Branch<T>
}

/** CORE, please client createContextStore or createGlobalStore\
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange
 * - object has merge to original store, not cover original store
 *
 */
export function createStore<T extends Record<string, any>>(
  defaultValue: T | Accessor<T>,
  options?: CreateSmartStoreOptions<T>,
): SmartStore<T> {
  const parsedDefaultValue = shrinkFn(defaultValue)
  const [store, rawSetStore] = _createStore<T>(parsedDefaultValue)
  const { branchStore, setBranchStore } = createBranchStore<T>(parsedDefaultValue)

  /** if pass a function, it will be treate with createEffect to track reactive */
  if (isFunction(defaultValue)) {
    createEffect(() => {
      const newValue = shrinkFn(defaultValue)
      setStore(newValue)
    })
  }

  function setStore(dispatch: ((prevValue: T) => Partial<T>) | Partial<T>): void {
    rawSetStore(dispatch as any)
    setBranchStore(unwrap(dispatch))
  }

  return { store, setStore, branchStore }
}
