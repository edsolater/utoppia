import { mapEntry, parallelAsyncTasks, shakeFalsy, shakeNil } from "@edsolater/fnkit"
import { jFetch } from "../../../../packages/jFetch"
import type { Prices } from "../store"
import type { TokenListStore } from "../types/tokenList"

export async function fetchTokenPrices(tokens: TokenListStore["tokens"], raydiumUrl: string): Promise<Prices> {
  type CoingeckoPriceFile = Record<string /* coingeckoid */, { usd?: number }>
  type RaydiumPriceFile = Record<string, number>
  if (!tokens || tokens.length === 0) return {}
  const coingeckoIds = shakeFalsy(Array.from(tokens.values()).map((t) => t?.extensions?.coingeckoId))
  const [coingeckoPrices, raydiumPrices] = await parallelAsyncTasks([
    jFetch<CoingeckoPriceFile>(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoIds}&vs_currencies=usd`,
    ).then((coingeckoPrices) => {
      const coingeckoIdMap = Object.fromEntries(tokens.map((t) => [t.mint, t.extensions?.coingeckoId]))
      const reversedCoingeckoIdMap = new Map(Object.entries(coingeckoIdMap).map(([k, v]) => [v, k]))
      const coingeckoTokenPrices = coingeckoPrices
        ? mapEntry(coingeckoPrices, (value, key) => [reversedCoingeckoIdMap.get(key), value.usd])
        : undefined
      return coingeckoTokenPrices
    }),
    jFetch<RaydiumPriceFile>(raydiumUrl),
  ])
  const prices = shakeNil({ ...coingeckoPrices, ...raydiumPrices })
  return prices
}
