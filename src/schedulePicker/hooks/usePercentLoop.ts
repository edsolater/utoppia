import { createTimeStamp, setIntervalWithSecondes, type AnyFn } from "@edsolater/fnkit"
import { createEffect, createSignal, on, onCleanup, onMount, type Accessor } from "solid-js"

/**
 * 0 ~ 1
 * mainly for {@link ../components/CircularProgress | CircularProgress}
 * @todo is it possible to use css not js thread?
 */
export function usePercentLoop({
  loop,
  onRoundEnd,
  eachSecondPercent = 1 / 10,
  updateEach = 1,
}: {
  updateEach?: number // default 1s 1 second each interval
  loop?: boolean
  onRoundEnd?: () => void
  eachSecondPercent?: number
} = {}): {
  percent: Accessor<number>
  reset: () => void
} {
  const [percent, setPercent] = createSignal(0) // 0 ~ 1

  const { startLoop, stopLoop } = useIntervalLoop({
    cb: () => {
      setPercent((percent) => {
        const nextPercent = percent + eachSecondPercent / updateEach
        if (nextPercent >= 1) {
          if (loop) {
            onRoundEnd?.()
            return 0
          } else {
            stopLoop()
            return 1
          }
        } else {
          return nextPercent
        }
      })
    },
    interval: updateEach,
  })

  onMount(() => {
    startLoop()
    onCleanup(stopLoop)
  })

  return {
    percent,
    reset() {
      setPercent(0)
    },
  }
}

export function useIntervalLoop({
  cb,
  interval = 1,
  immediate = true,
}: {
  cb?: () => void
  interval?: number
  immediate?: boolean
} = {}): {
  isRunning: Accessor<boolean>
  startLoop(): () => void // return stop action
  stopLoop(): void
  invokeOnce(): void
  lastInvokeTime: Accessor<number>
} {
  const [lastInvokeTime, setLastInvokeTime] = createSignal(0)
  const [isRunning, setIsRunning] = createSignal(false)
  let intervalId: any = null

  function startLoop() {
    if (isRunning()) return () => {}
    setIsRunning(true)
    intervalId = setIntervalWithSecondes(() => {
      invokeOnce()
    }, interval)
    if (immediate) {
      invokeOnce()
    }

    return stopLoop
  }

  function stopLoop() {
    setIsRunning(false)
    clearInterval(intervalId)
  }

  function invokeOnce() {
    setLastInvokeTime(createTimeStamp())
    cb?.()
  }

  // stop loop when component unmount
  onCleanup(stopLoop)

  return {
    lastInvokeTime,
    invokeOnce,
    isRunning,
    startLoop,
    stopLoop,
  }
}

/**
 * only can invoke once
 */
export function oneWayInvoke<F extends AnyFn>(fn: F): F {
  let invoked = false
  let result = null
  return ((...args: Parameters<F>) => {
    if (!invoked) {
      result = fn(...args)
      invoked = true
    }
    return result
  }) as F
}

function useFlattedValue(percent: Accessor<number>, options?: { /** default 0.001  */ minimum?: number }) {
  const [flattedPercent, setFlattedPercent] = createSignal(percent())
  createEffect(
    on(percent, (currentPercent) => {
      if (Math.abs(currentPercent - flattedPercent()) >= (options?.minimum ?? 0.001)) {
        setFlattedPercent(currentPercent)
      }
    }),
  )
  return flattedPercent
}
