import { getConnection } from "../connection/getConnection"
import { toPub } from "../../../utils/dataStructures/Publickey"

export function listenBalanceChangeEvent(options: {
  owner: string
  rpcUrl: string
  onChange(): void
  /** @default "confirmed" */
  commitment?: "confirmed" | "finalized"
}): { listenerId: number; remove(): void } | undefined {
  const connection = getConnection(options.rpcUrl)
  const owner = options.owner
  if (!connection || !owner) return
  const listenerId = connection.onAccountChange(
    toPub(owner),
    () => {
      options.onChange()
    },
    "confirmed",
  )
  return {
    listenerId,
    remove() {
      connection.removeAccountChangeListener(listenerId)
    },
  }
}

export function removeWalletBalanceChangeListener({ listenerId, rpcUrl }: { listenerId: number; rpcUrl: string }) {
  const connection = getConnection(rpcUrl)
  connection.removeAccountChangeListener(listenerId)
}

