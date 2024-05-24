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
   * when no visiableCheckers, means this subscribable is hidden
   * when any of visiableCheckers is true, means this subscribable is visiable;
   * when all of visiableCheckers is false, means this subscribable is hidden
   *
   * only effect exector will auto run if it's any observed Shuck is visiable \
   * visiable, so effect is meaningful 0for user
   */
  visiable: Subscribable<boolean>
  visiableCheckers: Map<any, boolean>
}

export interface CreateShuckOptions<T> {
  visiable?: boolean | "auto" // TODO: inply it means auto
  onChangeToVisiable?: () => void
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
     * only effect exector will auto run if it's any observed Shuck is visiable \
     * visiable, so effect is meaningful for user
     */
    visiable: createSubscribable(Boolean(options?.visiable), {
      subscribeFns: options?.onChangeToVisiable,
    }),
    visiableCheckers: new Map(),
    subscribedExecutors: new Set<TaskRunner>(),
  }) as Shuck<T>
  return proxiedSubscribable as Shuck<T>
}

export function isShuck<T>(value: any): value is Shuck<T> {
  return Boolean(isSubscribable(value) && value[shuckTag])
}

export function isShuckVisiable<T>(value: Shuck<T>) {
  return value.visiable()
}

export function isShuckHidden<T>(value: Shuck<T>) {
  return !value.visiable()
}

/** **only place** to invoke task taskrunner */
export function invokeTaskRunner(taskrunner: TaskRunner) {
  if (taskrunner.visiable) {
    asyncInvoke(taskrunner)
  }
}

export function updateShuckVisiable<T>(shuck: Shuck<T>) {
  for (const isVisiable of shuck.visiableCheckers.values()) {
    if (isVisiable) {
      shuck.visiable.set(true)
      return
    }
  }
  shuck.visiable.set(false)
  return
}

export function setShuckVisiableChecker<T>(shuck: Shuck<T>, visiable: boolean, key: any) {
  shuck.visiableCheckers.set(key, visiable)
  updateShuckVisiable(shuck)
}

export function deleteShuckVisibaleChecker<T>(shuck: Shuck<T>, key: any) {
  shuck.visiableCheckers.delete(key)
  updateShuckVisiable(shuck)
}

export function makeShuckVisiable<T>(shuck: Shuck<T>, key: any) {
  setShuckVisiableChecker(shuck, true, key)
}

export function makeShuckInvisiable<T>(shuck: Shuck<T>, key: any) {
  setShuckVisiableChecker(shuck, false, key)
}
