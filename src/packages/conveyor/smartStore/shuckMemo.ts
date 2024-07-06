import type { Subscribable } from "@edsolater/fnkit"
import { Shuck, createShuck } from "./shuck"
import type { TaskRunner } from "./task"

export const shuckTag = Symbol("shuckMemoTag")
interface ShuckMemo<T> extends Subscribable<T> {
  /** when detected, it is a Shuck  */
  [shuckTag]: boolean
  /**
   * used by TaskExecutor to track subscribable's visiability
   *
   * when no visibleCheckers, means this subscribable is hidden
   * when any of visibleCheckers is true, means this subscribable is visible;
   * when all of visibleCheckers is false, means this subscribable is hidden
   *
   * only effect exector will auto run if it's any observed Shuck is visible \
   * visible, so effect is meaningful 0for user
   */
  visible: Subscribable<boolean>
  visibleCheckers: Map<any, boolean>
  // when set this, means this object is a observable-subscribable
  subscribedExecutors: Set<TaskRunner>
}

/** like solidjs' createMemo */
export function createShuckMemo<T, U>(from: Shuck<T>, map: (value: T) => U): Shuck<U> {
  const shuck = createShuck(map(from()))
  from.subscribe((value) => shuck.set(map(value)))
  return shuck
}
