import { TxVersion as _TxVersion } from "@raydium-io/raydium-sdk";
import { UITxVersion } from "./txHandler";

/** from customized value to SDK specific value */

export function getSDKTxVersion(input: UITxVersion): _TxVersion {
  return input === "V0" ? _TxVersion.V0 : _TxVersion.LEGACY;
}
