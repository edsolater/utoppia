import { MayFn, isObject, mergeObjects, shrinkFn, type InfinityObjNode } from "@edsolater/fnkit"
import { Accessor } from "solid-js"
import { createFakeTree } from "./fakeTree"
import { Shuck, createShuck } from "./shuck"

export type SetBranchStore<T extends object> = (dispatcher: MayFn<Partial<T>, [old: T]>) => void

export type Branch<T> = T extends object
  ? InfinityObjNode<Shuck<T>> & { [K in keyof T]-?: Branch<T[K] extends object ? NonNullable<T[K]> : T[K]> }
  : InfinityObjNode<Shuck<T>> & Record<keyof any, InfinityObjNode<Shuck<undefined>>>

export type BranchStore<T extends object> = {
  branchStore: Branch<T>
  setBranchStore: SetBranchStore<T>
}

/**
 * @deprecated not easy to learn, just use {@link shuck} instead
 * {@link createFakeTree} is a low-level api, this is a high-level api
 * {@link createFakeTree} + {@link createShuck}
 *
 * Branch is composed by multi shucks
 *
 * branch means taskSubscribable nodes
 * CORE, should platform-less (no solidjs or React or Vue)
 * 🚧 use solid system to hold reactive system
 *
 * store has two feature:
 * - change onChange (TODO)
 * - object has merge to original store, not cover original store
 */
export function createBranchStore<T extends object>(defaultValue: T | Accessor<T>): BranchStore<T> {
  const rawDefaultValue = shrinkFn(defaultValue) as T
  // branch hold data
  const { tree, set } = createFakeTree(rawDefaultValue, {
    createLeaf: (rawValue) => createShuck(rawValue),
    injectValueToExistLeaf: (leaf, val) => leaf.set((p) => (isObject(val) && isObject(p) ? mergeObjects(p, val) : val)),
  })

  // A&Y: why must invoke xxx.yyy() to get value? to avoid leaf value(yyy) also have property named: yyy .e.g. { yyy: { subscribe: 1 } }, if root.yyy.subscribe , what's the result? 1 or subscribe function?
  return {
    branchStore: tree as any,
    setBranchStore: set,
  }
}
