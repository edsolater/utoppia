import type { InnerTransaction as SDKInnerTransaction } from "@raydium-io/raydium-sdk"
import { Keypair, VersionedTransaction } from "@solana/web3.js"
import { getMessagePort } from "../webworker/loadWorker_worker"
import { composeSDKInnerTransactions } from "./createVersionedTransaction"
import type { TxHandlerPayload } from "./txHandler"
import type { ID } from "@edsolater/fnkit"
import { reportLog } from "../../stores/data/utils/logger"
import { decode as decodeBase58 } from "bs58"

export type UnsignedTransactionInfo = {
  id: ID
  txs: Uint8Array[]
}
export type SignTransactionErrorInfo = {
  id: ID
  errorReason: string
}
export type SignTransactionSuccessInfo = {
  id: ID
  signedTxs: Uint8Array[]
}

let signId = 0
function getSignTransactionId(): ID {
  return signId++
}
export async function signAllTransactions({
  transactions,
  payload,
}: {
  transactions: SDKInnerTransaction[]
  payload: TxHandlerPayload
}): Promise<VersionedTransaction[]> {
  const buildedTransactions = await composeSDKInnerTransactions({
    connection: payload.connection,
    owner: payload.owner,
    transactions,
  })
  console.log("buildedTransactions: ", buildedTransactions)

  // temporary don't use privateKey to sign
  if (payload.privateKey) {
    console.log('payload.privateKey: ', payload.privateKey)
    const signedTxs = signWithPrivateKey({ txs: buildedTransactions, privateKey: payload.privateKey })
    return signedTxs
  } else {
    const port = getMessagePort("transform transaction")
    // send transaction form worker to main thread
    return new Promise((resolve, reject) => {
      const signId = getSignTransactionId()
      reportLog("[⚙️worker] send transactions to main thread", buildedTransactions)
      port.postMessage({
        id: signId,
        txs: buildedTransactions.map((tx) => tx.serialize()),
      } as UnsignedTransactionInfo)
      port.receiveMessage((signedTransactions: SignTransactionSuccessInfo | SignTransactionErrorInfo) => {
        if (signedTransactions.id !== signId) return
        if ("signedTxs" in signedTransactions) {
          const signedTxs = signedTransactions.signedTxs.map((transaction) =>
            VersionedTransaction.deserialize(transaction),
          )
          resolve(signedTxs)
        } else {
          reject(signedTransactions.errorReason)
        }
      })
    })
  }
}

async function signWithPrivateKey(payload: { txs: VersionedTransaction[]; privateKey: string }) {
  const keypair = toKeyPair(payload.privateKey)
  for (const tx of payload.txs) {
    console.log('tx: ', tx)
    console.log('keypair: ', keypair)
    tx.signatures = []
    tx.sign([keypair])
  }
  return payload.txs
}

function toKeyPair(privateKey: string): Keypair {
  const privateKeyU8 = new Uint8Array(decodeBase58(privateKey))
  return Keypair.fromSecretKey(privateKeyU8)
}
