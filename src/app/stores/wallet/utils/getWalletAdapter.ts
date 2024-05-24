import { supportedWallets } from "../constants/supportedWallets"
import { WalletsNames } from "../type"

/**
 * util function
 */
export function getWalletAdapter(name: WalletsNames) {
  return supportedWallets.find((wallet) => wallet.adapter.name.toLowerCase() === name.toLowerCase())!
}
