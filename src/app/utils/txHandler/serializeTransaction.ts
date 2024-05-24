import { VersionedTransaction } from "@solana/web3.js"

const txSerializeCache = new Map<string, Uint8Array>()
// show serialize before send tx (by raw connection)

/** @deprecated too complex, just use xxx.serialize() is enough */
export function serializeTransaction(transaction: VersionedTransaction, options?: { cache?: boolean }): Uint8Array {
  const key = transaction.message.recentBlockhash
  if (key && txSerializeCache.has(key)) {
    return txSerializeCache.get(key)!
  } else {
    const serialized = transaction.serialize()
    if (key && options?.cache) txSerializeCache.set(key, serialized)
    return serialized
  }
}

/** @deprecated too complex, just use VersionedTransaction.deserialize() is enough */
export function deserializeTransaction(serialized: Uint8Array): VersionedTransaction {
  return VersionedTransaction.deserialize(serialized)
}
