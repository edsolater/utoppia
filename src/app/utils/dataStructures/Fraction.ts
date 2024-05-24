import { Fraction as _Fraction } from "@raydium-io/raydium-sdk"
import { Fraction } from "./type"
import { ReplaceType } from "@edsolater/fnkit"

export function isSDKFraction(n: unknown): n is _Fraction {
  return n instanceof _Fraction
}

export type FlatSDKFraction<T> = ReplaceType<T, _Fraction, Fraction>
/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKFraction(n: _Fraction): Fraction {
  return { numerator: BigInt(n.numerator.toString()), denominator: BigInt(n.denominator.toString()) }
}
