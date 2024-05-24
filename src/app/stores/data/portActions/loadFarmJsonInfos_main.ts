import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../../utils/webworker/type"
import { setStore } from "../store"

/** u can see which this hook related to by checking import */
export function loadFarmJsonInfos() {
  setStore({ isFarmJsonLoading: true })
  const { sender, receiver } = getMessagePort(workerCommands["fetch raydium farms info"])
  sender.post()
  receiver.subscribe((allFarmJsonInfos) => {
    setStore({ isFarmJsonLoading: false, farmJsonInfos: allFarmJsonInfos })
  })
}
