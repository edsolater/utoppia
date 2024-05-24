import { toRecord } from "@edsolater/fnkit"
import type { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { type Tokens } from "../token/type"
import { SOLToken } from "../token/utils"
import { fetchTokenJsonFile } from "../utils/fetchTokenJson"
import { reportLog } from "../utils/logger"

export let workerCache_tokens: Tokens = {}
export function loadTokensInWorker(transformers: PortUtils) {
  const { receiver, sender } = transformers.getMessagePort("fetch raydium supported tokens")
  reportLog("[⚙️worker 🚪port] registered load token")
  receiver.subscribe((options) => {
    reportLog("[⚙️worker 🚧task] load tokens")
    /* TODO: currently only mainnet raydium token list was supported*/
    fetchTokenJsonFile(options)
      .then((res) => {
        const availableTokens = res?.tokens
          .filter((t) => !res?.blacklist.includes(t.mint) || t.name === "Native Solana")
          .concat(SOLToken) // replace api mistakely add SOL
        const tokens = toRecord(availableTokens, (t) => t.mint) as Tokens
        workerCache_tokens = tokens
        console.log('tokens.length: ', availableTokens?.length)
        return tokens
      })
      .then(sender.post)
  })
}
