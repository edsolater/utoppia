/**
 * *********
 * observe user action towards the object|function
 * *********
 */
import { createSubscribable, shrinkFn, invoke, asyncInvoke, assignObject } from "@edsolater/fnkit"
import { Shuck, isShuckvisible } from "./shuck"

export type TaskRunner = {
  (): Promise<void>
  relatedShucks: Shuck<any>[]
  readonly visible: boolean // TODO: need to be a subscribable
}
export type TaskManager = {
  // main method of task, run if needed (any of shucks is visible)
  run(): void
  taskRunner: TaskRunner
  destory(): void
}

const keyedTasks = new Map<string, TaskManager>()
/**
 * like solidjs's createEffect, will track all subscribable's getValue option in it
 * try to re-invoke when shunk's value or shuck's visiablity changed
 *
 * when relatedShucks is hinted, task function will only run when relatedShucks is visible
 * otherwise, initly task function must it to track the subscribables
 *
 *
 * @example
 * const testObserverableSubscribable = createLeaf(1)
 * const testObserverableSubscribableB = createLeaf(1, { visible: true })
 *
 * const task = createTask([testObserverableSubscribable, testObserverableSubscribableB], async (get) => {
 *   await Promise.resolve(3)
 * })
 */
// param:shucks should can be a object that {}
export function createTask(
  dependOns: Shuck<any>[],
  task: () => void,
  options?: {
    visible?: boolean | ((shucks: Shuck<any>[]) => boolean)
    /** if multi same key subscribeFns are registered, only last one will work  */
    key?: string
  },
) {
  const isTaskvisible = createSubscribable(checkAnyDependsvisible(dependOns))
  const taskRunner = (() => asyncInvoke(task)) as TaskRunner
  const unsubscribes: Set<() => void> = new Set()

  assignObject(taskRunner, {
    relatedShucks: dependOns,
    get visible() {
      return shrinkFn(options?.visible, [dependOns]) ?? dependOns.some(isShuckvisible)
    },
  })

  for (const shuck of dependOns) {
    // attachTaskToShuck(taskRunner, shuck) // task is triggered by subscribed shucks, but also attach shack to taskRunner make it easy to debug (easy for human to monitor the app tasks)
    const { unsubscribe: unsubscribeShuck } = shuck.subscribe((v) => {
      if (isTaskvisible()) {
        taskRunner()
      }
    })
    unsubscribes.add(unsubscribeShuck)
    const { unsubscribe: unsubscribeShuckvisible } = shuck.visible.subscribe(() => {
      const isAnyvisible = checkAnyDependsvisible(dependOns)
      isTaskvisible.set(isAnyvisible)
    })
    unsubscribes.add(unsubscribeShuckvisible)
  }

  const taskvisibleSubscription = isTaskvisible.subscribe((v) => {
    if (v) {
      taskRunner()
    }
  })

  unsubscribes.add(taskvisibleSubscription.unsubscribe)

  const manager: TaskManager = {
    taskRunner,
    run(config?: { force?: boolean }) {
      if (config?.force ?? taskRunner.visible) taskRunner()
    },
    destory() {
      unsubscribes.forEach((v) => v())
      unsubscribes.clear()
    },
  }
  manager.run() // initly run the task

  if (options?.key) {
    if (keyedTasks.has(options.key)) {
      keyedTasks.get(options.key)?.destory()
    }
    keyedTasks.set(options.key, manager)
  }
  return manager
}

function checkAnyDependsvisible(dependOns: Shuck<any>[]) {
  return dependOns.some((shuck) => shuck.visible)
}
