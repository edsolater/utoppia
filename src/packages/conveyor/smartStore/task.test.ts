import { expect, test } from "vitest"
import { createBranchStore } from "./branch"
import { setShuckVisiableChecker } from "./shuck"
import { createTask } from "./task"
import { asyncInvoke } from "@edsolater/fnkit"

test("basic usage", async () => {
  let effectRunCount = 0
  const { branchStore } = createBranchStore({ testCount: 1 })
  const testCount = branchStore.testCount()
  const effect = createTask([testCount], () => {
    const n = testCount()
    effectRunCount++
  })
  effect.run()
  testCount.set((n) => n + 1)
  expect(testCount()).toBe(2)
  expect(effectRunCount, "unvisiable effect not run yet").toBe(0)
  expect(testCount.visiable()).toBe(false)
  setShuckVisiableChecker(testCount, true, undefined)
  testCount.set((n) => n + 1)
  expect(effectRunCount, "effect should not run yet before async").toBe(0)
  asyncInvoke(() => {
    expect(effectRunCount, "effect should run 1 time after async").toBe(1)
  })
  expect.assertions(5)
})
