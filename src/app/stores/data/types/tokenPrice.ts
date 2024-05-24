import { Numberish } from "@edsolater/fnkit"
import { TokenListStore } from "./tokenList"

export interface TokenPriceWorkerData {
  prices: TokenPriceStore["prices"]
}
/** in fact, it has both raydium price and coingecko price */

export interface FetchRaydiumTokenPriceOptions {
  url: string
  tokens: TokenListStore["tokens"]
}

export interface TokenPriceStore {
  isTokenPriceLoading?: boolean
  prices?: { mint: string; price: Numberish }[]
}
