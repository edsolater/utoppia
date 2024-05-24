import { appApiUrls } from "../../../utils/common/config"
import type { Token, Tokens } from "../token/type"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { workerCommands } from "../../../utils/webworker/type"
import { shuck_isTokenListLoading, shuck_tokens } from "../store"
import { reportLog } from "../utils/logger"

export function loadTokens() {
  reportLog("[🤖main] start loading tokens")
  const { sender, receiver } = getMessagePort<Tokens, { url: string }>(workerCommands["fetch raydium supported tokens"])
  shuck_isTokenListLoading.set(true)
  sender.post({ url: appApiUrls.tokenInfo })
  receiver.subscribe((allTokens) => {
    shuck_isTokenListLoading.set(false)
    shuck_tokens.set(allTokens)
  })
}
