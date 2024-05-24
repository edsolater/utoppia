import { isObject, mergeObjects, InfinityObjNode, isInfinityNode } from "@edsolater/fnkit"
import { expect, test } from "vitest"
import { Shuck, createShuck, isShuck } from "./shuck"
import { createFakeTree } from "./fakeTree"

type OriginalObj = {
  a: number
  b: {
    c: number
  }
  dynamic?: { say?: string; hello?: string }
}

// copy from FakeTreeify
type FakeTreeify<T> = T extends object
  ? InfinityObjNode<Shuck<T>> & { [K in keyof T]-?: FakeTreeify<T[K] extends object ? NonNullable<T[K]> : T[K]> }
  : InfinityObjNode<Shuck<T>> & Record<keyof any, InfinityObjNode<Shuck<undefined>>>

test("basic usage", () => {
  const { rawObj, tree, set } = createFakeTree<OriginalObj, FakeTreeify<OriginalObj>>(
    { a: 1, b: { c: 2 } },
    {
      createLeaf: (rawValue) => createShuck(rawValue),
      injectValueToExistLeaf: (leaf, val) =>
        leaf.set((p) => (isObject(val) && isObject(p) ? mergeObjects(p, val) : val)),
    },
  )
  expect(rawObj, "rawObj will not change").toEqual({ a: 1, b: { c: 2 } })

  // node situation
  expect(isInfinityNode(tree.a)).toBe(true)
  expect(isShuck(tree.a())).toBe(true)
  expect(tree.a()()).toBe(1)

  expect(tree.dynamic()())
  // dynamicly create node
  set({ dynamic: { hello: "world" } })
  expect(tree.dynamic()()).toEqual({ hello: "world" })
  set({ dynamic: { say: "hello" } })
  expect(tree.dynamic()()).toEqual({ hello: "world", say: "hello" })
  expect(tree.dynamic.hello()()).toBe("world")
})
