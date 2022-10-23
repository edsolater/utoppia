import { GetObjectStoreParams, GetTransactionParams, XDBDatabase, XDBObjectStore } from './type'
import { getXDBFromOriginalIDB } from './idbToXDB'
import { Optional } from '../typeTools'

type GetDBParams = {
  name: string
  version?: number
  onUpgradeneeded(util: { ev: IDBVersionChangeEvent; xdb: XDBDatabase; idb: IDBDatabase }): void
}

/**
 * event:blocked or event:error will be a rejected promise
 * event:success will be a resolved promise
 */
export function getDB(params: GetDBParams): Promise<XDBDatabase> {
  return new Promise((resolve, reject) => {
    const originalRequest = globalThis.indexedDB.open(params.name, params.version)
    originalRequest.addEventListener('success', (ev) => {
      const originalIDB = originalRequest.result
      const xdb = getXDBFromOriginalIDB(originalIDB)
      resolve(xdb)
    })
    originalRequest.addEventListener('error', (ev) => reject(ev))
    originalRequest.addEventListener('blocked', (ev) => reject(ev))
    originalRequest.addEventListener('upgradeneeded', (ev) => {
      const { result: idb } = ev.target as unknown as { result: IDBDatabase }
      const xdb = getXDBFromOriginalIDB(idb)
      params.onUpgradeneeded({ ev, xdb, idb })
    })
  })
}

export async function getDBObjectStore(params: {
  dbOptions: GetDBParams
  transactionOptions?: Optional<GetTransactionParams, 'name'>
  objectStoreOptions: GetObjectStoreParams
}): Promise<XDBObjectStore> {
  const xdb = await getDB(params.dbOptions)
  const transaction = xdb.getTransaction({ ...params.transactionOptions, name: params.objectStoreOptions.name })
  const objectStore = transaction.getObjectStore(params.dbOptions)
  return objectStore
}