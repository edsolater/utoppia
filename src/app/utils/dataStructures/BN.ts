import { toBigint, type Fraction, type Numberish, type ReplaceType } from "@edsolater/fnkit"
import OriginalBN from "bn.js"

// plain object for easier structure clone
export type BN = Fraction

export function toSDKBN(n: Numberish): OriginalBN {
  return new OriginalBN(String(toBigint(n)))
}

export type FlatSDKBN<T> = ReplaceType<T, OriginalBN, bigint>

export function parseSDKBN(n: undefined): undefined
export function parseSDKBN(n: OriginalBN): bigint
export function parseSDKBN(n: OriginalBN | undefined): bigint | undefined
export function parseSDKBN(n: OriginalBN | undefined): bigint | undefined {
  if (n == null) return n
  return toBigint(n.toString())
}

export function isSDKBN(n: unknown): n is OriginalBN {
  return n instanceof OriginalBN
}
