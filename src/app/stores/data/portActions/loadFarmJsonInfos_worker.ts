import type { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { workerCommands } from "../../../utils/webworker/type"
import { fetchFarmJsonInfo } from "../utils/fetchFarmJson"
import { reportLog } from "../utils/logger"

export function loadFarmJsonInfosInWorker({ getMessagePort }: PortUtils) {
  const { receiver, sender } = getMessagePort(workerCommands["fetch raydium farms info"])
  reportLog("[⚙️worker] registered load farm port")
  receiver.subscribe((options) => {
    reportLog("[⚙️worker] start loading farms")
    fetchFarmJsonInfo().then(sender.post)
  })
}
