import { AnyFn, inNextMainLoop } from "@edsolater/fnkit"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import {
  CalculateSwapRouteInfosParams,
  calculateSwapRouteInfos,
  type CalculateSwapRouteInfosResult,
} from "../utils/calculateSwapRouteInfos"

let storedCleanUpFunction: AnyFn | undefined = undefined

export function calculateSwapRouteInfosInWorker({
  getMessagePort,
}: PortUtils<CalculateSwapRouteInfosParams, CalculateSwapRouteInfosResult>) {
  const port = getMessagePort("let webworker calculate swap route infos")
  port.receiveMessage((payload) => {
    storedCleanUpFunction?.()
    const { abort, result, assertNotAborted } = calculateSwapRouteInfos(payload)
    result.then(
      inNextMainLoop((result) => {
        assertNotAborted()
        port.postMessage(result)
      }),
    )
    storedCleanUpFunction = abort
  })
}
