import { AnyFn } from "@edsolater/fnkit"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos, composeFarmSYN } from "../utils/composeFarmSYN"
import { workerCommands } from "../../../utils/webworker/type"

let storedCleanUpFunction: AnyFn | undefined = undefined

export function loadFarmSYNInfosInWorker({ getMessagePort }: PortUtils<ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos>) {
  const { receiver, sender } = getMessagePort(workerCommands["get raydium farms syn infos"])
  receiver.subscribe((query) => {
    storedCleanUpFunction?.()
    const { abort, resultSubscribable } = composeFarmSYN(query)
    resultSubscribable.subscribe(sender.post)
    storedCleanUpFunction = abort
  })
}
