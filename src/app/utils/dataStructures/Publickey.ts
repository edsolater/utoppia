import { ReplaceType, createObjectFrom, deepCloneObject, isString, travelObject, tryCatch } from "@edsolater/fnkit"
import { PublicKeyish as _PublicKeyish } from "@raydium-io/raydium-sdk"
import { PublicKey, PublicKey as _PublicKey } from "@solana/web3.js"
import { produce } from "immer"

const mintCache = new WeakMap<_PublicKey, string>()

//TODO: no token
export function toPubString(mint: undefined | null): undefined
export function toPubString(mint: _PublicKeyish): string
export function toPubString(mint: _PublicKeyish | undefined | null): string | undefined
export function toPubString(mint: _PublicKeyish | undefined | null): string | undefined {
  if (!mint) return undefined
  if (isString(mint)) return mint
  if (mintCache.has(mint)) {
    return mintCache.get(mint)!
  } else {
    const mintString = mint.toBase58()
    mintCache.set(mint, mintString)
    return mintString
  }
}

// TODO: use mintCache
export function toPub(mint: _PublicKeyish): _PublicKey
export function toPub(mint: undefined): undefined
export function toPub(mint: _PublicKeyish | undefined): _PublicKey | undefined
export function toPub(mint: _PublicKeyish | undefined): _PublicKey | undefined {
  if (!mint) return undefined
  return new _PublicKey(mint)
}

export function tryToPub<T>(v: T): T | _PublicKey {
  return isString(v)
    ? tryCatch(
        () => new _PublicKey(v as any),
        () => v,
      )
    : v
}

export type FlatPublicKey<T> = ReplaceType<T, _PublicKey, string>

/**
 * just push the result to cache
 */
export function recordPubString(...args: Parameters<typeof toPubString>): void {
  toPubString(...args)
}

export function isPublicKey(v: unknown): v is _PublicKey {
  return v instanceof _PublicKey
}

export function isPublicKeyString(v: unknown): v is string {
  return isString(v) && base58Regex.test(v)
}

const defaultPublicKey = PublicKey.default

const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{10}$/ // don't know it's length

function objectlyToPubString<T extends object>(target: T): ReplaceType<T, _PublicKey, string> {
  // @ts-expect-error
  return produce(target, (draft) => {
    createObjectFrom(draft, ({ value }) => {
      if (isPublicKey(value)) {
        return toPubString(value)
      }
    })
  })
}

function objectlyToPub<T extends object>(target: T): ReplaceType<T, _PublicKey, string> {
  // @ts-expect-error
  return produce(target, (draft) => {
    createObjectFrom(draft, ({ value }) => {
      if (isPublicKeyString(value)) {
        return toPub(value)
      }
    })
  })
}
const original = {
  a: {
    content: defaultPublicKey,
  },
}

const parsed = objectlyToPubString(original)

console.log("original: ", original.a, parsed.a)
