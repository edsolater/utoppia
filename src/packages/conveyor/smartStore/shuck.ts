import {
  asyncInvoke,
  createSubscribable,
  isSubscribable,
  type IDNumber,
  type MayFn,
  type Subscribable,
} from "@edsolater/fnkit"
import { isShuckOption, type ShuckOption } from "./shuckOption"
import { type TaskRunner } from "./task"

export const shuckTag = Symbol("shuckTag")
export const shuckOptionTag = Symbol("shuckOptionTag")

/**
 * add ability to pure subscribable
 */
export interface Shuck<T> extends Subscribable<T> {
  /** when detected, it is a Shuck  */
  [shuckTag]: boolean
  id: IDNumber
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
}

export interface CreateShuckOptions<T> {
  visible?: boolean | "auto" // TODO: inply it means auto
  onChangeTovisible?: () => void
}

/** create special subscribable */
export function createShuck<T>(): Shuck<T | undefined>
export function createShuck<T>(defaultValue: MayFn<T>, options?: CreateShuckOptions<T>): Shuck<T>
export function createShuck<T>(subscribable: Subscribable<T>, options?: CreateShuckOptions<T>): Shuck<T>
export function createShuck<T>(shuckOption: ShuckOption<T>): Shuck<T>
export function createShuck<T>(
  ...args:
    | [subscribable: Subscribable<T>, options?: CreateShuckOptions<T>]
    | [defaultValue: any, options?: CreateShuckOptions<T>]
    | [option: ShuckOption<T>]
): Shuck<T> {
  const [subscribable, options] = (
    isSubscribable(args[0]) // already input subscribable
      ? [args[0], args[1]]
      : isShuckOption(args[0])
        ? // @ts-ignore
          [createSubscribable(args[0].value, args[0]), args[0]]
        : // @ts-ignore
          [createSubscribable(args[0], args[1]), args[1]]
  ) as [subscribable: Subscribable<T>, options?: CreateShuckOptions<T>]

  const proxiedSubscribable = Object.assign(subscribable, {
    [shuckTag]: true,
    /**
     * only effect exector will auto run if it's any observed Shuck is visible \
     * visible, so effect is meaningful for user
     */
    visible: createSubscribable(Boolean(options?.visible), {
      onSet: options?.onChangeTovisible,
    }),
    visibleCheckers: new Map(),
    subscribedExecutors: new Set<TaskRunner>(),
  }) as Shuck<T>
  return proxiedSubscribable as Shuck<T>
}

export function isShuck<T>(value: any): value is Shuck<T> {
  return Boolean(isSubscribable(value) && value[shuckTag])
}

export function isShuckvisible<T>(value: Shuck<T>) {
  return value.visible()
}

export function isShuckHidden<T>(value: Shuck<T>) {
  return !value.visible()
}

/** **only place** to invoke task taskrunner */
export function invokeTaskRunner(taskrunner: TaskRunner) {
  if (taskrunner.visible) {
    asyncInvoke(taskrunner)
  }
}

export function updateShuckvisible<T>(shuck: Shuck<T>) {
  for (const isvisible of shuck.visibleCheckers.values()) {
    if (isvisible) {
      shuck.visible.set(true)
      return
    }
  }
  shuck.visible.set(false)
  return
}

export function setShuckvisibleChecker<T>(shuck: Shuck<T>, visible: boolean, key: any) {
  shuck.visibleCheckers.set(key, visible)
  updateShuckvisible(shuck)
}

export function deleteShuckVisibaleChecker<T>(shuck: Shuck<T>, key: any) {
  shuck.visibleCheckers.delete(key)
  updateShuckvisible(shuck)
}

export function makeShuckvisible<T>(shuck: Shuck<T>, key: any) {
  setShuckvisibleChecker(shuck, true, key)
}

export function makeShuckInvisible<T>(shuck: Shuck<T>, key: any) {
  setShuckvisibleChecker(shuck, false, key)
}
