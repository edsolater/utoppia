import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import type { Prices } from "../store"
import { fetchTokenPrices } from "../utils/fetchTokenPrices"

export const workerCache_prices: Prices = {}

export function loadTokenPriceInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort("get raydium token prices")
  receiver.subscribe((options) => {
    fetchTokenPrices(options.tokens, options.url).then((res) => {
      Object.assign(workerCache_prices, res)
      return sender.post({ prices: res })
    })
  })
}
