import { AnyFn, map } from '@edsolater/fnkit'
import { WeakerSet } from '../neuron/WeakerSet'
import { createSubscription, Subscription } from './Subscription'

type EventConfig = {
  [eventName: string]: AnyFn
}

type EventCenter<T extends EventConfig> = {
  /**
   * for server-provider
   */
  register<N extends keyof T>(eventName: N, handlerFn: T[N]): void
  emit<N extends keyof T>(eventName: N, parameters: Parameters<T[N]>): void
  on<U extends Partial<T>>(subscriptionFns: U): { [P in keyof U]: Subscription<U[P]> }
} & {
  [P in keyof T as `on${Capitalize<P & string>}`]: (
    subscriptionFn: (...params: Parameters<T[P]>) => void
  ) => Subscription<T[P]>
}

// 💡 observable should be the core of js model. just like event target is the core of DOM
export function createEventCenter<T extends EventConfig>(): EventCenter<T> {
  const callbackCenter = new Map<keyof T, WeakerSet<AnyFn>>()

  const emit = ((eventName, paramters) => {
    const handlerFns = callbackCenter.get(eventName)
    handlerFns?.forEach((fn) => {
      fn.call(undefined, paramters)
    })
  }) as EventCenter<T>['emit']

  const on = ((subscriptionFns) =>
    map(subscriptionFns, (handlerFn, eventName) => {
      // @ts-expect-error no need to care
      callbackCenter.set(eventName, (callbackCenter.get(eventName) ?? new WeakerSet()).add(handlerFn))
      const subscription = createSubscription({
        unsubscribe() {
          // @ts-expect-error no need to care
          callbackCenter.set(eventName, callbackCenter.get(eventName)?.delete(handlerFn))
        }
      })
      return subscription
    })) as EventCenter<T>['on']

  const specifiedOn = (eventName: string, handlerFn: AnyFn) => {
    const { [eventName]: subscription } = on({ [eventName]: handlerFn } as Partial<T>)
    return subscription
  }

  const eventCenter = new Proxy(
    { on, emit },
    {
      get(target, p) {
        if (target[p] !== undefined) return target[p]
        if (String(p).startsWith('on')) return (p: string, handler: AnyFn) => specifiedOn(p, handler)
        return undefined
      }
    }
  ) as unknown as EventCenter<T>
  return eventCenter
}