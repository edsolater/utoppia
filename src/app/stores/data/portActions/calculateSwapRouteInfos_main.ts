import { deepUnwrapSolidProxy } from "../../../utils/txHandler/deepUnwrapSolidProxy"
import { getMessageSender } from "../../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../../utils/webworker/type"
import { CalculateSwapRouteInfosParams } from "../utils/calculateSwapRouteInfos"

export function calculatedSwapRouteInfos_main(params: CalculateSwapRouteInfosParams) {
  return getMessageSender(workerCommands["let webworker calculate swap route infos"]).post(deepUnwrapSolidProxy(params))
}
