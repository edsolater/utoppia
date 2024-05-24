import { TxVersion as SDK_TxVersion } from "@raydium-io/raydium-sdk"

export const txVersionV0 = "V0"
export const txVersionLegacy = "LEGACY"
export type TxVersion = typeof txVersionV0 | typeof txVersionLegacy
export function getRealSDKTxVersion(txVersion?: TxVersion) {
  if (!txVersion) return SDK_TxVersion.LEGACY
  return txVersion === txVersionV0 ? SDK_TxVersion.V0 : SDK_TxVersion.LEGACY
}
