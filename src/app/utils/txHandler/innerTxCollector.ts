import { isArray } from "@edsolater/fnkit"
import type { InnerTransaction } from "@raydium-io/raydium-sdk"
import type {
  MultiTxsOption,
  TransactionCollector,
  TransactionQueue,
  TxHandlerOption,
  TxHandlerOptions,
} from "./txHandler"
import { merge } from "@edsolater/fnkit"

/**
 * collector's aim: use `.add` method to load innerTransactions
 */
export function createInnerTxCollector(txHandlerOptions: TxHandlerOptions | undefined) {
  const { additionalSingleOptionCallbacks, additionalMultiOptionCallbacks, ...multiTxOption } = txHandlerOptions ?? {} // shortcut TODO: test the core
  const singleTxOptions = [] as TxHandlerOption[]
  const innerTransactions = [] as InnerTransaction[]

  /**
   * mutable
   */
  const addSingle = (transaction: InnerTransaction, options?: TxHandlerOption) => {
    innerTransactions.push(transaction)
    singleTxOptions.push(merge(options ?? {}, additionalSingleOptionCallbacks ?? {}))
  }

  /**
   * mutable
   */
  const addQueue = (transactionQueue: TransactionQueue, options?: MultiTxsOption) => {
    transactionQueue.forEach((transaction) => {
      const [singelTransation, singelOption] = Array.isArray(transaction) ? transaction : ([transaction] as const)
      addSingle(singelTransation, singelOption)
    })
    Object.assign(multiTxOption, merge(options ?? {}, additionalMultiOptionCallbacks ?? {}))
  }

  /**
   * {@link addSingle} + {@link addQueue}
   */
  const add: TransactionCollector["add"] = (transactions, option) => {
    const isQueue = isArray(transactions)
    if (isQueue) {
      const injectedTransactions: TransactionQueue = transactions.map((t) =>
        isArray(t) ? [t[0], { ...option, ...t[1] }] : [t, option],
      )
      addQueue(injectedTransactions, option)
    } else {
      addSingle(transactions, option)
    }
  }

  const transactionCollector: TransactionCollector = { add }
  return {
    transactionCollector,
    collected: { collectedTransactions: innerTransactions, singleTxOptions, multiTxOption },
  }
}
