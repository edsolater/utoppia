import { add, setItem, toIterable, type Numberish } from "@edsolater/fnkit"
import { createTask } from "../../../../packages/conveyor/smartStore/task"
import type { TokenAccount } from "../../../utils/dataStructures/TokenAccount"
import type { Mint, PublicKey } from "../../../utils/dataStructures/type"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_balances, shuck_isTokenAccountsLoading, shuck_owner, shuck_rpc, shuck_tokenAccounts } from "../store"
import { reportLog } from "../utils/logger"

export type FetchTokenAccountsQueryParams = { rpcUrl: string; owner: string; canUseCache: boolean }
export type TokenAccounts = Record<PublicKey, TokenAccount>

export function loadOwnerTokenAccountsAndBalances() {
  registerTokenAccountsReceiver()
  const taskManager = createTask(
    [shuck_rpc, shuck_owner],
    () => {
      refreshTokenAccounts()
    },
    { visiable: true },
  )
  return taskManager
}

export function registerTokenAccountsReceiver() {
  const port = getMessagePort<TokenAccounts, FetchTokenAccountsQueryParams>("fetch owner token accounts")
  port.receiveMessage(
    (tokenAccounts) => {
      reportLog("[🤖main] token accounts ", tokenAccounts)
      shuck_isTokenAccountsLoading.set(false)
      shuck_tokenAccounts.set((o) => ({ ...o, ...tokenAccounts }))
      const balances: Record<Mint, Numberish> = {}
      for (const tokenAccount of toIterable(tokenAccounts)) {
        setItem(balances, tokenAccount.mint, (balance) =>
          balance ? add(balance, tokenAccount.amount) : tokenAccount.amount,
        )
      }
      shuck_balances.set(balances)
    },
    { key: "[🤖main] receive tokenAccounts" },
  )
}

export function refreshTokenAccounts({ canUseCache = true }: { canUseCache?: boolean } = {}) {
  const port = getMessagePort<TokenAccounts, FetchTokenAccountsQueryParams>("fetch owner token accounts")
  const url = shuck_rpc()?.url
  const owner = shuck_owner()
  if (!url || !owner) return
  console.count("[🤖main owner token accounts] start refreshing")
  shuck_isTokenAccountsLoading.set(true)
  port.postMessage({
    rpcUrl: url,
    owner,
    canUseCache,
  })
}
