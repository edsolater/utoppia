import { get } from "@edsolater/fnkit"
import type { Mint } from "../../../utils/dataStructures/type"
import type { Tokens } from "./type"

/**
 * check whether token is Token2022
 * !!! check inner token state
 */
export default function isCurrentToken2022(mint: Mint, payload: { tokens: Tokens | undefined }): boolean {
  const token = get(payload.tokens, mint)
  return token?.extensions?.version === "TOKEN2022"
}
