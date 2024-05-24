import { count, toList } from "@edsolater/fnkit"
import { appApiUrls } from "../../../utils/common/config"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_isTokenPricesLoading, shuck_tokenPrices, shuck_tokens, type Prices } from "../store"
import type { Token } from "../token/type"
import { reportLog } from "../utils/logger"

export function loadTokenPrice() {
  shuck_tokens.subscribe((tokens) => {
    const hasAnyToken = count(tokens) > 0
    // console.log("tokens: ", tokens)
    if (!hasAnyToken) return
    shuck_isTokenPricesLoading.set(true)
    const { sender, receiver } = getMessagePort<{ prices: Prices }, { url: string; tokens: Token[] }>(
      "get raydium token prices",
    )
    reportLog("[🤖main] 📢query token prices")
    sender.post({
      url: appApiUrls.price,
      tokens: toList(tokens),
    })
    receiver.subscribe(({ prices }) => {
      shuck_isTokenPricesLoading.set(false)
      shuck_tokenPrices.set(prices)
    })
  })
}
