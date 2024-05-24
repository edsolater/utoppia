import { Numberish, div, parseAnatomyFractionInfo } from "@edsolater/fnkit"
import { Percent as SDK_Percent } from "@raydium-io/raydium-sdk"
import BN from "bn.js"
import { toSDKBN } from "./BN"
import type { Percent } from "./type"

/**
 * only use this method for SDK, **not** use it in ui layer, it  will only appear in webworker(for data calculate)
 * @example
 * toPercent(3.14) // => Percent { 314.00% }
 * toPercent(3.14, { alreadyDecimaled: true }) // => Percent {3.14%}
 */
export function toSDKPercent(
  n: Numberish,
  options?: { /* usually used for backend data */ alreadyDecimaled?: boolean },
) {
  const { numerator, denominator } = parseAnatomyFractionInfo(n)
  return new SDK_Percent(toSDKBN(numerator), toSDKBN(denominator).mul(options?.alreadyDecimaled ? new BN(100) : new BN(1)))
}

export function toPercent(
  n: Numberish,
  options?: { /* usually used for backend data */ alreadyDecimaled?: boolean },
): Percent {
  return options?.alreadyDecimaled ? div(n, 100) : n
}
