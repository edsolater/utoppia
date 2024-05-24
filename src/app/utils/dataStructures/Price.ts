import { Price as _Price } from "@raydium-io/raydium-sdk"
import { Price } from "./type"
import { parseSDKFraction } from "./Fraction"
import { ReplaceType } from "@edsolater/fnkit"

export function isSDKPrice(n: unknown): n is _Price {
  return n instanceof _Price
}

export type FlatSDKPrice<T> = ReplaceType<T, _Price, Price>

/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKPrice(n: _Price): Price {
  return parseSDKFraction(n)
}
