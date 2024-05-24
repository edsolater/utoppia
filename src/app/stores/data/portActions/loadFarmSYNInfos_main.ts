import { createEffect, onCleanup } from "solid-js"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../../utils/webworker/type"
import { useWalletStore } from "../../wallet/store"
import { setStore, store } from "../store"
import { ComposeFarmSYNInfoQuery, ComposedFarmSYNInfos } from "../utils/composeFarmSYN"

/**
 * will change state
 */
export function loadFarmSYNInfos() {
  const walletStore = useWalletStore()
  const owner = walletStore.owner
  setStore({ isFarmInfosLoading: true })
  createEffect(() => {
    const rpcUrl = store.rpc?.url
    if (!rpcUrl) return
    const { sender, receiver } = getMessagePort<ComposedFarmSYNInfos, ComposeFarmSYNInfoQuery>(
      workerCommands["get raydium farms syn infos"],
    )
    sender.post({ owner, rpcUrl })
    const { unsubscribe } = receiver.subscribe((allFarmSYNInfos) => {
      setStore({ isFarmInfosLoading: false, farmInfos: allFarmSYNInfos })
    })
    onCleanup(unsubscribe)
  })
}
