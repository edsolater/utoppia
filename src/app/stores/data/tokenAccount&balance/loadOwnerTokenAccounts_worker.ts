import type { AnyFn } from "@edsolater/fnkit"
import { getTokenAccounts } from "../../../utils/dataStructures/TokenAccount"
import type { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import type { FetchTokenAccountsQueryParams, TokenAccounts } from "./loadOwnerTokenAccounts_main"
import { listenBalanceChangeEvent } from "./walletBalanceChangeListener"
import { reportLog } from "../utils/logger"

export function loadOwnerTokenAccountsInWorker({
  getMessagePort,
}: PortUtils<FetchTokenAccountsQueryParams, TokenAccounts>) {
  const port = getMessagePort("fetch owner token accounts")
  reportLog("[⚙️worker] register fetch owner token accounts")

  let registeredOwner: string
  let registeredRpcUrl: string
  let cleanFn: AnyFn

  port.receiveMessage((query) => {
    function forcelyRefreshTokenAccounts() {
      const tokenAccountsPromise = getTokenAccounts({
        canUseCache: false,
        owner: query.owner,
        connection: query.rpcUrl,
      })
      tokenAccountsPromise?.then(({ tokenAccounts }) => {
        port.postMessage(tokenAccounts)
      })
    }

    if (query.owner !== registeredOwner || query.rpcUrl !== registeredRpcUrl) {
      registeredOwner = query.owner
      registeredRpcUrl = query.rpcUrl
      cleanFn?.()
      listenBalanceChangeEvent({
        owner: query.owner,
        rpcUrl: query.rpcUrl,
        onChange: forcelyRefreshTokenAccounts,
      })
    }

    forcelyRefreshTokenAccounts()
  })
}
