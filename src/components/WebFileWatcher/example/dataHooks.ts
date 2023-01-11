import { mergeFunction, useAsyncEffect } from '@edsolater/hookit'
import { RefObject, useRef, useState } from 'react'
import { getXDBObjectStore } from '../../../xdb'
import { XDBObjectStore } from '../../../xdb/type'
import { initData, WebFileWatcherItem } from './dataInitShape'

export const useXDBList = () => {
  const [webFileWatcher, setList] = useState<WebFileWatcherItem[]>([])
  const objectStoreRef = useRef<XDBObjectStore<WebFileWatcherItem>>()

  //#region ------------------- subscribe to xdb's onChange -------------------
  useAsyncEffect(async () => {
    const objectStore = await getXDBObjectStore<WebFileWatcherItem>({
      dbOptions: {
        name: 'my-database',
        version: 2
      },
      objectStoreInitOptions: {
        name: 'album',
        keyPath: 'createAt',
        initRecords: initData
      }
    })

    objectStoreRef.current = objectStore

    const subscription = objectStore.onInit(async ({ objectStore }) => {
      const list = await objectStore.getAll()
      setList(list)
    }, {})

    const subscription2 = objectStore.onChange(async ({ objectStore }) => {
      const list = await objectStore.getAll()
      setList(list)
    })

    return mergeFunction(subscription.unsubscribe, subscription2.unsubscribe)
  }, [])
  //#endregion

  //#region ------------------- ioninser Data -------------------
  const insertTodoItem = (info: { todoTitle: string }) => {
    if (!objectStoreRef.current) return
    objectStoreRef.current.set({ title: info.todoTitle, createAt: new Date() })
  }

  const deleteTodoItem = (info: { item: WebFileWatcherItem }) => {
    if (!objectStoreRef.current) return
    objectStoreRef.current.delete(info.item)
  }

  const clearItems = () => {
    if (!objectStoreRef.current) return
    objectStoreRef.current.clear()
  }
  const undo = () => {
    objectStoreRef.current?.undo()
  }
  const redo = () => {
    objectStoreRef.current?.redo()
  }
  //#endregion

  return {
    webFileWatcher,
    insertTodoItem: insertTodoItem,
    deleteTodoItem: deleteTodoItem,
    clear: clearItems,
    undo,
    redo
  }
}

function getOfRef<T, P extends keyof T>(ref: React.MutableRefObject<T | undefined>, property: P): RefObject<T[P]> {
  return {
    get current() {
      return ref.current?.[property] ?? null
    }
  }
}
