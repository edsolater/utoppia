import { get } from "@edsolater/fnkit"
import { shuck_tokens } from "../store"

/**
 * @todo should link to a proxy that may return when token is aviliable in future
 * @deprecated use {@link getCurrentToken} instead
 */
export function getToken(mint: string | undefined) {
  return mint ? get(shuck_tokens(), mint) : undefined
}
