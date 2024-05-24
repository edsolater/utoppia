import { assert } from "@edsolater/fnkit"
import { connectWallet } from "../utils/connectWallet"
import { WalletAdapterInterface } from "../type"
import { useWalletStore } from "../store"

export async function connect(wallet: WalletAdapterInterface) {
  return connectWallet(wallet).then(() => {
    assert(wallet.adapter.publicKey, "Wallet connected failed")
    useWalletStore().$setters.setConnected(true)
    useWalletStore().$setters.setCurrentWallet(wallet)
  })
}
