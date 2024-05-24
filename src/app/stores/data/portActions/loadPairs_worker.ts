import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { fetchPairJsonInfo } from "../utils/fetchPairJson"
import { reportLog } from "../utils/logger"

export function loadPairsInWorker({ getMessagePort }: PortUtils) {
  const { receiver, sender } = getMessagePort("fetch raydium pairs info")
  console.info("loadPairs_worker")
  receiver.subscribe(() => {
    reportLog("[⚙️worker] start fetch pairs info")
    fetchPairJsonInfo().then((pairsJSON) => {
      console.log("pairsJSON.length: ", pairsJSON?.length)
      return sender.post(pairsJSON)
    })
  })
}
