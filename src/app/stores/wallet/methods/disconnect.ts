import { disconnectWallet } from "../utils/disconnectWallet"
import { useWalletStore } from "../store"

export async function disconnect() {
  return useWalletStore().currentWallet
    ? disconnectWallet(useWalletStore().currentWallet!).then(() => {
        useWalletStore().$setters.setConnected(false)
        useWalletStore().$setters.setCurrentWallet(undefined)
      })
    : Promise.resolve()
}
