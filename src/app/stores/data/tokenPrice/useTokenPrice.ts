import { get } from "@edsolater/fnkit"
import { createMemo, type Accessor } from "solid-js"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import type { Price } from "../../../utils/dataStructures/type"
import { shuck_tokenPrices } from "../store"
import { type Tokenable } from "../token/type"
import { useToken } from "../token/useToken"

/**
 * use this in .tsx
 * easy to use & easy to read
 * turn a short info (only tokenPrice'mint) into rich
 * whether loaded or not, it will return a tokenPrice (even emptyTokenPrice)
 *
 * it use solidjs's createStore to store a object data
 */

export function useTokenPrice(params?: Tokenable): Accessor<Price | undefined> {
  const token = useToken(params)
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const price = createMemo(() => {
    const prices = pricesMap()
    return get(prices, token.mint)
  })
  return price
}
