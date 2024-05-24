import { autoConnectWallet } from "../utils/autoConnectWallet"
import { useWalletStore } from "../store"

export function initlyConnectPhantom() {
  autoConnectWallet({
    onLoadSuccess: ({ adapterInterface }) => {
      useWalletStore().$setters.setHasInited(true)
      useWalletStore().$setters.setConnected(true)
      useWalletStore().$setters.setCurrentWallet(adapterInterface)
    },
    onBeforeInit: () => {
      useWalletStore().$setters.setHasInited(false)
    },
    onAfterInit: () => {
      useWalletStore().$setters.setHasInited(true)
    },
  })
}
