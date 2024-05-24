import { isObject, isString, type ReplaceType } from "@edsolater/fnkit"
import { Currency as SDK_Currency, Token as SDK_Token } from "@raydium-io/raydium-sdk"
import { PublicKey } from "@solana/web3.js"
import type { Token, Tokenable } from "./type"
import type { Mint } from "../../../utils/dataStructures/type"

/** Address of the SPL Token program */
export const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" // from SDK
/** Address of the SPL Token 2022 program */
export const TOKEN_2022_PROGRAM_ID = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" // from SDK

const SOLMint = PublicKey.default.toString()
export const SOLToken = {
  id: SOLMint,
  mint: SOLMint,
  programId: TOKEN_PROGRAM_ID,
  decimals: 9,

  symbol: "SOL",
  name: "solana",
  is: "sol",
} satisfies Token

const WSOLMint = "So11111111111111111111111111111111111111112"
export const SDK_TOKEN_WSOL = new SDK_Token(TOKEN_PROGRAM_ID, WSOLMint, SOLToken.decimals, "WSOL", "wrapped solana")
export const SDK_CURRENCY_SOL = new SDK_Currency(SOLToken.decimals, "SOL", "solana")
export const TOKEN_SOL: Token = {
  id: SOLMint,
  mint: SOLMint,
  programId: TOKEN_PROGRAM_ID,
  decimals: 9,
  symbol: "SOL",
  name: "solana",
  is: "sol",
}

/** only for SDK: unWrap may QuantumSOL to Token or Currency */
export function toSDKToken(token: Token): SDK_Token | SDK_Currency {
  if (token.is === "sol") return SDK_CURRENCY_SOL
  return new SDK_Token(token.programId, token.mint, token.decimals, token.symbol, token.name)
}

export function isSDKToken(token: unknown): token is SDK_Currency | SDK_Token {
  return token instanceof SDK_Currency || token instanceof SDK_Token
}

export type FlatSDKToken<T> = ReplaceType<T, SDK_Currency | SDK_Token, Token>

/**
 * SDK value → UI prefer transformable object literal value
 */
export function parseSDKToken(token: SDK_Currency | SDK_Token): Token {
  if (isSDKTokenSOL(token)) {
    return TOKEN_SOL
  } else {
    const t = token as SDK_Token
    const mint = t.mint.toString()
    return {
      id: mint,
      mint,
      programId: t.programId.toString(),
      decimals: t.decimals,
      symbol: t.symbol,
      name: t.name,
    }
  }
}

function isSDKTokenSOL(token: SDK_Currency | SDK_Token): token is typeof TOKEN_SOL {
  return token.name === "solana" && token.symbol?.toLowerCase() === "SOL".toLowerCase()
}
export function isTokenSOLWSOL(token: Token | Mint): boolean {
  return isString(token) ? token === SOLMint || token === WSOLMint : token.id === SOLMint || token.id === WSOLMint
}

export function isToken(token: unknown): token is Token {
  return isObject(token) && isString((token as Token).mint) && typeof (token as Token).decimals === "number"
}

/**
 * check whether token is {@link defaultToken}
 * @param token to be checked
 * @returns boolean(type guard)
 */
export function isDefaultToken(token: Token): boolean {
  return token.is === "default-empty-token"
}

/**
 * check whether token is {@link loadingToken}
 * @param token to be checked
 * @returns boolean(type guard)
 */
export function isLoadingToken(token: Token): boolean {
  return token.is === "loading-token"
}

/**
 * check whether token is {@link errorToken}
 * @param token to be checked
 * @returns boolean(type guard)
 */
export function isErrorToken(token: Token): boolean {
  return token.is === "error-token"
}

let tempTokenId = 1
const tempTokenIdGenerator = () => tempTokenId++
export const defaultToken: () => Token = () => ({
  id: tempTokenIdGenerator().toString(),
  programId: TOKEN_PROGRAM_ID,
  mint: "",
  decimals: 0,
  is: "default-empty-token",
})

export const loadingToken: () => Token = () => ({
  id: tempTokenIdGenerator().toString(),
  programId: TOKEN_PROGRAM_ID,
  mint: "",
  decimals: 0,
  is: "loading-token",
})

export const errorToken: () => Token = () => ({
  id: tempTokenIdGenerator().toString(),
  programId: TOKEN_PROGRAM_ID,
  mint: "",
  decimals: 0,
  is: "error-token",
})

export function toToken(config: Token) {
  return config
}
