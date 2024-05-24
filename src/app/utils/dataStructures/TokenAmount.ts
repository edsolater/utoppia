import { applyDecimal, type Numberish, type ReplaceType } from "@edsolater/fnkit"
import {
  CurrencyAmount as SDK_CurrencyAmount,
  Token as SDK_Token,
  TokenAmount as SDK_TokenAmount,
} from "@raydium-io/raydium-sdk"
import type { Token } from "../../stores/data/token/type"
import { SDK_CURRENCY_SOL, TOKEN_SOL, parseSDKToken } from "../../stores/data/token/utils"
import { parseSDKBN, toSDKBN } from "./BN"

export interface TokenAmount {
  token: Token
  /** value that is amount */
  amount: Amount
}

/**
 * bnamount is not decimaled
 * e.g. 1234124
 */
export type AmountBN = Numberish

/**
 * decimaled amount
 * e.g. 1234.124
 */
export type Amount = Numberish

export type FlatSDKTokenAmount<T> = ReplaceType<T, SDK_CurrencyAmount | SDK_TokenAmount, TokenAmount>

export function deUITokenAmount(tokenAmount: TokenAmount): SDK_TokenAmount | SDK_CurrencyAmount {
  const isSol = tokenAmount.token.is === "sol"
  if (isSol) {
    const token = SDK_CURRENCY_SOL
    return new SDK_CurrencyAmount(token, toSDKBN(applyDecimal(tokenAmount.amount, -token.decimals))) // which means error appears
  } else {
    const token = new SDK_Token(
      tokenAmount.token.programId,
      tokenAmount.token.mint,
      tokenAmount.token.decimals,
      tokenAmount.token.symbol,
      tokenAmount.token.name,
    )
    return new SDK_TokenAmount(token, toSDKBN(applyDecimal(tokenAmount.amount, -token.decimals))) // which means error appears
  }
}

export function toTokenAmount(token: Token, amount: Numberish, options?: { amountIsBN?: boolean }): TokenAmount {
  return { token, amount: options?.amountIsBN ? applyDecimal(amount, token.decimals) : amount }
}

export function isSDKTokenAmount(amount: unknown): amount is SDK_TokenAmount | SDK_CurrencyAmount {
  return amount instanceof SDK_TokenAmount || amount instanceof SDK_CurrencyAmount
}

/**
 * SDK tokenAmount → UI prefer transformable object literal tokenAmount
 */
export function parseSDKTokenAmount(tokenAmount: SDK_CurrencyAmount | SDK_TokenAmount): TokenAmount {
  if (isSDKCurrencyAmount(tokenAmount)) {
    return toTokenAmount(TOKEN_SOL, parseSDKBN(tokenAmount.raw), { amountIsBN: true })
  } else {
    const ta = tokenAmount as SDK_TokenAmount
    return toTokenAmount(parseSDKToken(ta.token), parseSDKBN(ta.raw), { amountIsBN: true })
  }
}

export function getAmountBNFromTokenAmount(tokenAmount: TokenAmount): AmountBN {
  return applyDecimal(tokenAmount.amount, -tokenAmount.token.decimals)
}

function isSDKCurrencyAmount(amount: unknown): amount is SDK_CurrencyAmount {
  return amount instanceof SDK_CurrencyAmount
}
