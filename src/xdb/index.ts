import { SKeyof } from '@edsolater/fnkit'
import { XDBObjectStoreOptions, XDBDatabase, XDBObjectStore, XDBRecordTemplate, XDBTemplate } from './type'
import { wrapToXDB } from './wrapToXDB'

type XDBOptions = {
  name: string
  version?: number
  onUpgradeneeded?(util: { ev: IDBVersionChangeEvent; idb: IDBDatabase }): void
}

/**
 * event:blocked or event:error will be a rejected promise
 * event:success will be a resolved promise
 */
function getXDB<S extends XDBTemplate = XDBTemplate>(params: XDBOptions): Promise<XDBDatabase<S>> {
  return new Promise((resolve, reject) => {
    const originalRequest = globalThis.indexedDB.open(params.name, params.version)
    originalRequest.addEventListener('success', () => {
      const originalIDB = originalRequest.result
      const xdb = wrapToXDB(originalIDB)
      resolve(xdb)
    })
    originalRequest.addEventListener('error', (ev) => reject(ev))
    originalRequest.addEventListener('blocked', (ev) => reject(ev))
    originalRequest.addEventListener('upgradeneeded', (ev) => {
      const { result: idb } = ev.target as unknown as { result: IDBDatabase }
      params.onUpgradeneeded?.({ ev, idb })
    })
  })
}

type XDBObjectStoreAutoCreateOptions<T extends XDBRecordTemplate> = {
  keyPath?: SKeyof<T>
  autoIncrement?: boolean
  indexes?: { property: SKeyof<T>; options?: IDBIndexParameters }[]
  initRecords?: T[]
}

export async function getXDBObjectStore<T extends XDBRecordTemplate = XDBRecordTemplate>(params: {
  dbOptions: XDBOptions
  objectStoreInitOptions: XDBObjectStoreOptions & Partial<XDBObjectStoreAutoCreateOptions<T>>
}): Promise<XDBObjectStore<T>> {
  const { name, keyPath, indexes, initRecords, autoIncrement } = params.objectStoreInitOptions
  let shouldHaveInit = false

  const xdb = await getXDB<Record<string, T[]>>({
    onUpgradeneeded({ idb }) {
      shouldHaveInit = true
      const objectStore = idb.createObjectStore(name, { keyPath, autoIncrement })
      indexes?.forEach(({ property, options }) => {
        objectStore.createIndex(String(property), String(property), options)
      })
    },
    ...params.dbOptions
  })

  const objectStore = xdb.getObjectStore({ name })

  // init data
  if (shouldHaveInit && initRecords) {
    objectStore.setItems(initRecords)
  }

  return objectStore
}
