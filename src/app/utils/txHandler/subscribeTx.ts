import type { Connection, Transaction, VersionedTransaction } from "@solana/web3.js"
import type { MultiTxExtraInfo, TxErrorInfo, TxFinalInfo, TxSuccessInfo } from "./txHandler"
import { type EventCenter, createEventCenter, assert } from "@edsolater/fnkit"

export interface SubscribeSignatureCallbacks {
  onTxSuccess?(ev: TxSuccessInfo): void
  onTxError?(ev: TxErrorInfo): void
  onTxFinally?(ev: TxFinalInfo): void
}

export type TxSubscribeEventCenter = EventCenter<{
  txError: [info: TxErrorInfo]
  txSuccess: [info: TxSuccessInfo]
  txFinally: [info: TxFinalInfo]
}>

// @ts-ignore
globalThis["window"] = globalThis // load for connection rpc use window 😥

export function subscribeTx({
  txid,
  transaction, // payload
  connection,
  extraTxidInfo,
}: {
  txid: string
  transaction: VersionedTransaction
  connection?: Connection
  extraTxidInfo: MultiTxExtraInfo
}): TxSubscribeEventCenter {
  // TODO:
  const eventCenter = createEventCenter() as unknown as TxSubscribeEventCenter
  assert(connection, "successful connection is required")
  connection?.onSignature(
    txid,
    (signatureResult, context) => {
      if (signatureResult.err) {
        eventCenter.emit("txError", [
          {
            txid,
            transaction,
            signatureResult,
            context,
            error: signatureResult.err,
            ...extraTxidInfo,
          },
        ])
        eventCenter.emit("txFinally", [
          { txid, transaction, signatureResult, context, type: "error", ...extraTxidInfo },
        ])
      } else {
        eventCenter.emit("txSuccess", [{ txid, transaction, signatureResult, context, ...extraTxidInfo }])
        eventCenter.emit("txFinally", [
          { txid, transaction, signatureResult, context, type: "success", ...extraTxidInfo },
        ])
      }
    },
    "processed",
  )
  connection.getSignatureStatus(txid)
  return eventCenter
}

// TODO: if transactionSignature is pending over 30 seconds. should check it manually
