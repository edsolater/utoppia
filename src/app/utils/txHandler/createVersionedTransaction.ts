import { isObject } from "@edsolater/fnkit"
import {
  type InnerTransaction as SDKInnerTransaction,
  type PublicKeyish,
  LOOKUP_TABLE_CACHE as SDK_LOOKUP_TABLE_CACHE,
  TxVersion,
  buildSimpleTransaction,
} from "@raydium-io/raydium-sdk"
import type { Connection, VersionedTransaction } from "@solana/web3.js"
import { toPub } from "../dataStructures/Publickey"
import { reportLog } from "../../stores/data/utils/logger"

export async function composeSDKInnerTransactions({
  connection,
  owner,
  transactions,
}: {
  connection: Connection
  owner: PublicKeyish
  transactions: SDKInnerTransaction[]
}): Promise<VersionedTransaction[]> {
  const params = {
    connection,
    payer: toPub(owner),
    innerTransactions: transactions,
    makeTxVersion: TxVersion.V0, // force
    addLookupTableInfo: SDK_LOOKUP_TABLE_CACHE,
  }
  reportLog("[⚙️worker] params: ", params)
  const spawnedTransactions = (await buildSimpleTransaction(params).catch((e) => {
    console.error(e)
  })) as VersionedTransaction[]
  if (!spawnedTransactions) return []
  reportLog("[⚙️worker] spawnedTransactions: ", spawnedTransactions)
  return spawnedTransactions
}

export function isInnerTransaction(x: any): x is SDKInnerTransaction {
  return isObject(x) && "instructions" in x && "instructionTypes" in x
}
