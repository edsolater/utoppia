import type { VersionedTransaction } from "@solana/web3.js"

import { serializeTransaction } from "./serializeTransaction"
import type { TxHandlerPayload } from "./txHandler"

type Txid = string

export async function sendSingleTransaction({
  transaction,
  payload,
  cache,
}: {
  transaction: VersionedTransaction
  payload: TxHandlerPayload
  cache: boolean
}): Promise<Txid> {
  const tx = serializeTransaction(transaction, { cache })
  return await payload.connection.sendRawTransaction(tx, {
    skipPreflight: true,
  })
}
