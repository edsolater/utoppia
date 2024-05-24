import { InnerTransactions, type MultiTxsOption } from "./txHandler"
import type { Connection } from "@solana/web3.js"
import { handleTx } from "./txHandler"

/** use {@link handleTxModule} to handleTx easier */
export type TransactionModule = InnerTransactions & { connection: Connection; owner: string; privateKey?: string }

/**
 * handle {@link TransactionModule}
 */
export function handleTxModule(txShortcut: TransactionModule) {
  return handleTx(
    { connection: txShortcut.connection, owner: txShortcut.owner, privateKey: txShortcut.privateKey },
    () => txShortcut,
  )
} /** use {@link handleTxFromShortcut} to handleTx easier */

export function handleMultiTxModules(txShortcuts: TransactionModule[], options?: MultiTxsOption) {
  if (!txShortcuts.length) return
  return handleTx(
    { connection: txShortcuts[0].connection, owner: txShortcuts[0].owner, privateKey: txShortcuts[0].privateKey },
    () => txShortcuts.flat(),
    options,
  )
}
