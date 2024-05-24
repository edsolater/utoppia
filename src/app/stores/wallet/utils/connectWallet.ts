import { WalletAdapterInterface } from "../type"

/** util function
 * @see https://github.dev/solana-labs/wallet-adapter/tree/master/packages/core/base
 */
export function connectWallet(wallet: WalletAdapterInterface): Promise<void> {
  return wallet.adapter.connect()
}
