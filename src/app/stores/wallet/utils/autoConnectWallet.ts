import { toPubString } from "../../../utils/dataStructures/Publickey"
import { WalletAdapterInterface } from "../type"
import { connectWallet } from "./connectWallet"
import { getWalletAdapter } from "./getWalletAdapter"

export async function autoConnectWallet(cbs?: {
  onLoadSuccess?(utils: { owner: string; adapterInterface: WalletAdapterInterface }): void
  onBeforeInit?(): void
  onAfterInit?(): void
}) {
  cbs?.onBeforeInit?.()
  const phantomWallet = getWalletAdapter("Phantom")
  if (!phantomWallet) {
    throw new Error("Phantom wallet not found")
  }
  connectWallet(phantomWallet).then(() => {
    if (!phantomWallet.adapter.publicKey) {
      throw new Error("Phantom wallet not connected")
    }
    const owner = toPubString(phantomWallet.adapter.publicKey)
    cbs?.onLoadSuccess?.({ owner, adapterInterface: phantomWallet })
  })
  cbs?.onAfterInit?.()
}
