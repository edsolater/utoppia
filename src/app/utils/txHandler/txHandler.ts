import {
  assert,
  createEventCenter,
  emptyFn,
  isObject,
  mergeFunction,
  shakeNil,
  type EventCenter,
  type MayPromise,
} from "@edsolater/fnkit"
import {
  TxVersion,
  type CacheLTA,
  type ComputeBudgetConfig,
  type InnerSimpleLegacyTransaction as SDK_InnerSimpleTransaction,
} from "@raydium-io/raydium-sdk"
import type {
  Connection,
  Context,
  PublicKey,
  SignatureResult,
  Transaction,
  TransactionError,
  VersionedTransaction,
} from "@solana/web3.js"
import { produce } from "immer"
import { getConnection } from "../../stores/data/connection/getConnection"
import { toPub } from "../dataStructures/Publickey"
import { getTokenAccounts, type SDK_TokenAccount } from "../dataStructures/TokenAccount"
import { getTxHandlerBudgetConfig } from "./getTxHandlerBudgetConfig"
import { createInnerTxCollector } from "./innerTxCollector"
import { sendSingleTransaction } from "./sendTransactionCore"
import { signAllTransactions } from "./signAllTransactions_worker"
import { subscribeTx, type TxSubscribeEventCenter } from "./subscribeTx"
import { reportLog } from "../../stores/data/utils/logger"

export type UITxVersion = "V0" | "LEGACY"
//#region ------------------- basic info -------------------
export interface TxInfo {
  txid: string
  transaction: VersionedTransaction
}

// a utils to create TxParams
export type TxParams<O extends object> = O & {
  privateKey?: string
}
export type TxUIParams<O extends object> = O & {
  privateKey?: string
}

export interface MultiTxExtraInfo {
  isMulti: boolean
  /** only used in multi mode */
  transactions: VersionedTransaction[]
  /** only used in multi mode */
  txids: string[]
  /** only used in multi mode */
  currentIndex: number // in multi transactions
  /** only used in multi mode */
  multiTransactionLength: number // in transactions
}
//#endregion

//#region ------------------- lifeTime info -------------------
export interface TxSuccessInfo extends TxInfo, MultiTxExtraInfo {
  signatureResult: SignatureResult
  context: Context
}
export interface TxSendSuccessInfo extends TxInfo, MultiTxExtraInfo {}
export interface TxFinalBatchSuccessInfo {
  allSuccess: true
  txids: string[]
}
export interface TxErrorInfo extends TxInfo, MultiTxExtraInfo {
  signatureResult: SignatureResult
  context: Context
  error?: TransactionError
}
export interface TxSendErrorInfo extends Omit<TxInfo, "txid">, Omit<MultiTxExtraInfo, "passedMultiTxids"> {
  err: unknown
}
export type TxFinalInfo =
  | ({
      type: "success"
    } & TxSuccessInfo)
  | ({
      type: "error"
    } & TxErrorInfo)
export interface TxFinalBatchErrorInfo {
  allSuccess: false
  errorAt: number
  txids: string[] // before absort
}
export type TxDoneInfo = {}

export type TxHandlerUtils = {
  owner: PublicKey
  connection: Connection
  sdkTxVersion: TxVersion
  getSDKTokenAccounts(options?: { canUseCache?: boolean }): Promise<SDK_TokenAccount[] | undefined>
  getSDKBudgetConfig(): Promise<ComputeBudgetConfig | undefined>
  /** just past to sdk method. UI should do nothing with sdkLookupTableCache */
  sdkLookupTableCache: CacheLTA
}

export type InnerTransactions = TransactionQueue | SDK_InnerSimpleTransaction
//#endregion

/**
 *  defined user logic in this function
 */
export type TxFn = (utils: {
  eventCenter: TxHandlerEventCenter
  baseUtils: TxHandlerUtils
}) => MayPromise<InnerTransactions>

//#region ------------------- callbacks -------------------
type TxSuccessCallback = (info: TxSuccessInfo) => void
type TxErrorCallback = (info: TxErrorInfo) => void
type TxFinallyCallback = (info: TxFinalInfo) => void
type TxSendSuccessCallback = (info: TxSendSuccessInfo) => void
type TxSendErrorCallback = (info: TxSendErrorInfo) => void
type TxSentFinallyCallback = () => void
type TxAllDoneCallback = (info: { txids: string[] }) => void
type TxBeforeSendCallback = () => void
type TxBeforeSendErrorCallback = (err: unknown) => void
type TxAllSuccessCallback = (info: { txids: string[] }) => void
type TxAnyErrorCallback = (info: { txids: string[] /* error at last txids */ }) => void

//#endregion

export interface TxHandlerOption extends SingleTxCallbacks {
  /** @deprecated no need!!!. It's not pure */
  txHistoryInfo?: unknown
  /** if provided, error notification should respect this config
   * @deprecated no need!!!. It's not pure
   */
  txErrorNotificationDescription?: string | ((error: Error) => string)

  /**
   * for multi-mode
   *
   * will send this transaction even prev has error
   *
   * (will ignore in first tx)
   *
   * @default 'success' when sendMode is 'queue'
   * @default 'finally' when sendMode is 'queue(continue-without-check-transaction-response)'
   */
  continueWhenPreviousTx?: "success" | "error" | "finally"

  /** send multi same recentBlockhash tx will only send first one */
  cacheTransaction?: boolean
}

export interface SingleTxCallbacks {
  onTxSuccess?: TxSuccessCallback
  onTxError?: TxErrorCallback
  onTxFinally?: TxFinallyCallback
  onSendSuccess?: TxSendSuccessCallback
  onSendError?: TxSendErrorCallback
  onSendFinally?: TxSentFinallyCallback
  onTxAllDone?: TxAllDoneCallback
}

export interface MultiTxsOption extends MultiTxCallbacks {
  /**
   * send next when prev is complete (default)
   * send all at once
   * @default 'queue'
   */
  sendMode?:
    | "queue"
    | "queue(continue-without-check-transaction-response)"
    | "parallel" /* couldn't promise tx's order */
}

export interface MultiTxCallbacks {
  onTxAllSuccess?: TxAllSuccessCallback
  onTxAnyError?: TxAnyErrorCallback
  onTxAllDone?: TxAllDoneCallback
}

export type TransactionQueue = (
  | [tx: SDK_InnerSimpleTransaction, singleTxOptions?: TxHandlerOption]
  | SDK_InnerSimpleTransaction
)[]

export interface TransactionCollector {
  add(transaction: TransactionQueue | SDK_InnerSimpleTransaction, options?: TxHandlerOption & MultiTxsOption): void
}

// TODO: should also export addTxSuccessListener() and addTxErrorListener() and addTxFinallyListener()
export interface TxResponseInfos {
  allSuccess: boolean
  txids: string[]
  error: unknown
  // errorAt?: number // only if `allSuccess` is false
  // txList: (TxSuccessInfo | TxErrorInfo)[]
}

export interface TxHandlerOptions extends MultiTxsOption {
  additionalSingleOptionCallbacks?: SingleTxCallbacks
  additionalMultiOptionCallbacks?: MultiTxCallbacks
}

export type SignAllTransactionsFunction = <T extends VersionedTransaction>(transactions: T[]) => Promise<T[]>

export type TxHandlerPayload = {
  connection: Connection
  owner: string
  privateKey?: string
}

type TxHandlerEventCenterCallbacks = {
  beforeSend: Parameters<TxBeforeSendCallback>
  beforeSendError: Parameters<TxBeforeSendErrorCallback>
  txSendSuccess: Parameters<TxSendSuccessCallback>
  txSendError: Parameters<TxSendErrorCallback>
  txSuccess: Parameters<TxSuccessCallback>
  txError: Parameters<TxErrorCallback>
  txAllSuccess: Parameters<TxAllSuccessCallback>
  txAnyError: Parameters<TxAnyErrorCallback>
  txAllDone: Parameters<TxAllDoneCallback>
}

export type TxHandlerEventCenter = EventCenter<TxHandlerEventCenterCallbacks>

export function isVersionedTransaction(transaction: VersionedTransaction): transaction is VersionedTransaction {
  return isObject(transaction) && "version" in transaction
}

/** just pass to SDK Methods */
export const sdkLookupTableCache: CacheLTA = {}

export const getTxHandlerUtils = (
  payload: { owner: string; rpcUrl: string } | { owner: string; connection: Connection },
): TxHandlerUtils => {
  const connection = "connection" in payload ? payload.connection : getConnection(payload.rpcUrl)
  return {
    owner: toPub(payload.owner),
    connection,
    sdkTxVersion: TxVersion.V0,
    sdkLookupTableCache,
    getSDKTokenAccounts: ({ canUseCache = true }: { canUseCache?: true } = {}) =>
      getTokenAccounts({ canUseCache, connection, owner: payload.owner }).then((res) => res.sdkTokenAccounts),
    getSDKBudgetConfig: getTxHandlerBudgetConfig,
  }
}

/**
 *
 *  function for sending transaction
 */
export function handleTx(payload: TxHandlerPayload, txFn: TxFn, options?: TxHandlerOptions): TxHandlerEventCenter {
  const {
    transactionCollector,
    collected: { collectedTransactions, singleTxOptions, multiTxOption },
  } = createInnerTxCollector(options)

  const eventCenter = createEventCenter<TxHandlerEventCenterCallbacks>({ destoryAfterEmit: "txAllDone" })
  ;(async () => {
    assert(payload.connection, "provided connection not working")
    assert(payload.owner, "wallet not connected")
    const userLoadedTransactionQueue = await txFn({
      eventCenter,
      baseUtils: getTxHandlerUtils({ owner: payload.owner, connection: payload.connection }),
    })
    transactionCollector.add(userLoadedTransactionQueue)

    const parsedSignleTxOptions = makeMultiOptionIntoSignalOptions({
      transactions: collectedTransactions,
      singleOptions: singleTxOptions,
      multiOption: multiTxOption,
    })

    eventCenter.on("txSendSuccess", (info) => {
      parsedSignleTxOptions[info.currentIndex]?.onSendSuccess?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onSendFinally?.()
    })
    eventCenter.on("txSendError", (info) => {
      parsedSignleTxOptions[info.currentIndex]?.onSendError?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onSendFinally?.()
    })
    eventCenter.on("txSuccess", (info: TxSuccessInfo) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxSuccess?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxFinally?.({ ...info, type: "success" })
    })
    eventCenter.on("txError", (info: TxErrorInfo) => {
      parsedSignleTxOptions[info.currentIndex]?.onTxError?.(info)
      parsedSignleTxOptions[info.currentIndex]?.onTxFinally?.({ ...info, type: "error" })
    })
    eventCenter.on("txAllSuccess", (info) => {
      multiTxOption?.onTxAllSuccess?.(info)
    })
    eventCenter.on("txAnyError", (info) => {
      multiTxOption?.onTxAnyError?.(info)
    })
    eventCenter.on("txAllDone", (info) => {
      multiTxOption?.onTxAllDone?.(info)
    })

    // sign all transactions
    const allSignedTransactions = await signAllTransactions({
      transactions: collectedTransactions,
      payload,
    })
    reportLog("[⚙️worker] main thread sign transactions complete", allSignedTransactions)
    // load send tx function
    const senderFn = composeTxLauncher({
      transactions: allSignedTransactions,
      sendMode: multiTxOption.sendMode,
      singleOptions: parsedSignleTxOptions,
      payload,
      callbacks: {
        onTxSendError: (info) => {
          console.log("txSendError", info)
          eventCenter.emit("txSendError", [info])
        },
        onTxSendSuccess(info) {
          console.log("txSendSuccess", info)
          eventCenter.emit("txSendSuccess", [info])
        },
        onTxError(info) {
          console.log("txError", info)
          eventCenter.emit("txError", [info])
        },
        onTxSuccess(info) {
          console.log("txSuccess", info)
          eventCenter.emit("txSuccess", [info])
        },
        onTxAllSuccess(info) {
          console.log("txAllSuccess", info)
          eventCenter.emit("txAllSuccess", [info])
        },
        onTxAnyError(info) {
          console.log("txAnyError", info)
          eventCenter.emit("txAnyError", [info])
        },
        onTxAllDone(info) {
          console.log("txAllDone", info)
          eventCenter.emit("txAllDone", [info])
        },
      },
    })

    // send tx
    senderFn()
  })().catch((error) => {
    console.warn("[⚙️worker] error in handleTx", error) // FIXME: Why not emit error?
    eventCenter.emit("beforeSendError", [error]) // usually sign rejected by user
  })
  return eventCenter
}

/**
 * duty:
 * 1. signAllTransactions
 * 2. record tx to recentTxHistory
 *
 * so this fn will record txids
 */
function makeMultiOptionIntoSignalOptions({
  transactions,
  singleOptions,
  multiOption,
}: {
  transactions: (Transaction | SDK_InnerSimpleTransaction)[]
  singleOptions: TxHandlerOption[]
  multiOption: MultiTxsOption
}): TxHandlerOption[] {
  const txids = [] as string[]
  const successTxids = [] as typeof txids

  const pushSuccessTxid = (txid: string) => {
    successTxids.push(txid)
    if (successTxids.length === transactions.length) {
      multiOption.onTxAllSuccess?.({ txids })
    }
  }

  const parseMultiOptionsIntoSingleOptions = produce(singleOptions, (options) => {
    options.forEach((option) => {
      option.onSendSuccess = mergeFunction(
        (({ txid }) => {
          txids.push(txid)
        }) as TxSendSuccessCallback,
        option.onSendSuccess ?? (() => {}),
      )
      option.onTxError = mergeFunction(
        (() => {
          multiOption.onTxAnyError?.({ txids })
        }) as TxErrorCallback,
        option.onTxError ?? (() => {}),
      )
      option.onTxSuccess = mergeFunction(
        (({ txid }) => {
          pushSuccessTxid(txid)
        }) as TxSuccessCallback,
        option.onTxSuccess ?? (() => {}),
      )
    })
  })
  return parseMultiOptionsIntoSingleOptions
}

function composeTxLauncher({
  transactions,
  sendMode,
  singleOptions,
  payload,
  callbacks,
}: {
  transactions: VersionedTransaction[]
  sendMode: MultiTxsOption["sendMode"]
  singleOptions: TxHandlerOption[]
  payload: TxHandlerPayload
  callbacks: {
    onBeforeSend?: TxBeforeSendCallback
    onTxSuccess?: TxSuccessCallback
    onTxError?: TxErrorCallback
    onTxFinally?: TxFinallyCallback
    onTxSendSuccess?: TxSendSuccessCallback
    onTxSendError?: TxSendErrorCallback
    onTxAllSuccess?: TxAllSuccessCallback
    onTxAnyError?: TxAnyErrorCallback
    onTxAllDone?: TxAllDoneCallback
  }
}): () => void {
  const wholeTxidInfo: Omit<MultiTxExtraInfo, "currentIndex"> = {
    isMulti: transactions.length > 1,
    txids: Array.from({ length: transactions.length }),
    multiTransactionLength: transactions.length,
    transactions,
  }
  const multiTransactionCallbackControllers = createMultiTxCallbackControllers({
    txTotalCount: transactions.length,
    callbacks: {
      onTxAllSuccess: callbacks.onTxAllSuccess,
      onTxAnyError: callbacks.onTxAnyError,
      onTxAllDone: callbacks.onTxAllDone,
    },
  })

  const launchTransactions = (() => {
    if (sendMode === "parallel") {
      const parallelled = () => {
        transactions.forEach((tx, idx) => {
          const txCenter = sendOneTransactionWithOptions({
            transaction: tx,
            wholeTxidInfo,
            payload,
            singleOption: singleOptions[idx],
            callbacks: {
              onBeforeSend: callbacks.onBeforeSend,
              onSendSuccess: callbacks.onTxSendSuccess,
              onSendError: callbacks.onTxSendError,
              onTxSuccess: callbacks.onTxSuccess,
              onTxError: callbacks.onTxError,
              onTxFinally: callbacks.onTxFinally,
            },
          })
          txCenter.then((txEventCenter) => {
            txEventCenter?.on("txFinally", (info) => {
              multiTransactionCallbackControllers.markTxAsDone(idx, info)
              setTimeout(() => {
                txEventCenter.clear()
              })
            })
          })
        })
      }
      return parallelled
    } else {
      const queued = transactions.reduceRight(
        ({ fn, method }, tx, idx) => {
          const singleOption = singleOptions[idx]
          return {
            fn: () => {
              const txCenter = sendOneTransactionWithOptions({
                transaction: tx,
                wholeTxidInfo,
                payload,
                singleOption,
                callbacks: {
                  onBeforeSend: callbacks.onBeforeSend,
                  onSendSuccess: callbacks.onTxSendSuccess,
                  onSendError: callbacks.onTxSendError,
                  onTxSuccess: mergeFunction(fn, callbacks?.onTxSuccess ?? emptyFn),
                  onTxError:
                    method === "finally" ? mergeFunction(fn, callbacks?.onTxError ?? emptyFn) : callbacks.onTxError,
                  onTxFinally: callbacks.onTxFinally,
                },
              })
              txCenter.then((txEventCenter) => {
                txEventCenter?.on("txFinally", (info) => {
                  multiTransactionCallbackControllers.markTxAsDone(idx, info)
                })
              })
            },
            method:
              singleOption.continueWhenPreviousTx ??
              (sendMode === "queue(continue-without-check-transaction-response)" ? "finally" : "success"),
          }
        },
        { fn: () => {}, method: "success" },
      )
      return queued.fn
    }
  })()

  return launchTransactions
}

/**
 * it will subscribe txid
 */
async function sendOneTransactionWithOptions({
  transaction,
  wholeTxidInfo,
  singleOption,
  callbacks,
  payload,
}: {
  transaction: VersionedTransaction
  wholeTxidInfo: Omit<MultiTxExtraInfo, "currentIndex">
  singleOption?: TxHandlerOption
  callbacks?: {
    onTxSuccess?: TxSuccessCallback
    onTxError?: TxErrorCallback
    onTxFinally?: TxFinallyCallback

    onBeforeSend?: TxBeforeSendCallback
    onSendSuccess?: TxSendSuccessCallback
    onSendError?: TxSendErrorCallback
  }
  payload: TxHandlerPayload
}): Promise<TxSubscribeEventCenter | undefined> {
  const currentIndex = wholeTxidInfo.transactions.indexOf(transaction)
  const extraTxidInfo: MultiTxExtraInfo = {
    ...wholeTxidInfo,
    currentIndex,
  }
  try {
    callbacks?.onBeforeSend?.()
    const txid = await sendSingleTransaction({ transaction, payload, cache: Boolean(singleOption?.cacheTransaction) })
    assert(txid, "something went wrong in sending transaction, getted txid empty")
    callbacks?.onSendSuccess?.({ transaction, txid, ...extraTxidInfo })

    wholeTxidInfo.txids[currentIndex] = txid //! 💩 bad method! it's mutate method!
    const txEventCenter = subscribeTx({
      txid,
      transaction,
      extraTxidInfo,
      connection: payload.connection,
    })

    // re-emit tx event
    txEventCenter.on("txSuccess", (info) => {
      callbacks?.onTxSuccess?.({ ...info, ...extraTxidInfo })
    })
    txEventCenter.on("txError", (info) => {
      callbacks?.onTxError?.({ ...info, ...extraTxidInfo })
    })
    txEventCenter.on("txFinally", (info) => {
      callbacks?.onTxFinally?.({ ...info, ...extraTxidInfo })
    })
    return txEventCenter
  } catch (err) {
    callbacks?.onSendError?.({ err, transaction, ...extraTxidInfo })
  }
}
function createMultiTxCallbackControllers(options: {
  txTotalCount: number
  callbacks: {
    onTxAllSuccess?: TxAllSuccessCallback | undefined
    onTxAnyError?: TxAnyErrorCallback | undefined
    onTxAllDone?: TxAllDoneCallback | undefined
  }
}): {
  markTxAsDone: (idx: number, info: TxFinalInfo) => void
} {
  let hasSendError = false // for onTxAnyError may check multiple times, but it should only fire once
  const txInfos = Array(options.txTotalCount).fill(undefined) as (TxFinalInfo | undefined)[]
  function checkIfAllSuccess() {
    if (txInfos.length === options.txTotalCount && txInfos.every((info) => info?.type === "success")) {
      options.callbacks.onTxAllSuccess?.({ txids: txInfos.map((info) => info!.txid) })
    }
  }
  function checkIfAnyError() {
    if (txInfos.length === options.txTotalCount && !hasSendError && txInfos.some((info) => info?.type === "error")) {
      hasSendError = true
      options.callbacks.onTxAnyError?.({ txids: shakeNil(txInfos.map((info) => info?.txid)) })
    }
  }
  function checkIfAllDone() {
    if (txInfos.length === options.txTotalCount && txInfos.every(Boolean)) {
      options.callbacks.onTxAllDone?.({ txids: txInfos.map((info) => info!.txid) })
    }
  }
  return {
    markTxAsDone(idx, info) {
      txInfos[idx] = info
      checkIfAllSuccess()
      checkIfAnyError()
      checkIfAllDone()
    },
  }
}
