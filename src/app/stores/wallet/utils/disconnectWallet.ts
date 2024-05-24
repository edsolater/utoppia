import { WalletAdapterInterface } from "../type"

export function disconnectWallet(oldWallet: WalletAdapterInterface): Promise<void> {
  return oldWallet.adapter.disconnect()
}
