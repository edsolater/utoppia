import { mergeFunction } from '@edsolater/fnkit'
import { useAsyncEffect } from '@edsolater/uikit/hooks'
import { RefObject, useRef, useState } from 'react'
import { getXDBObjectStore } from '../../../xdb'
import { XDBObjectStore } from '../../../xdb/type'
import { initData, TodoListItem } from './dataInitShape'

export const useXDBList = () => {
  const [todoList, setList] = useState<TodoListItem[]>([])
  const objectStoreRef = useRef<XDBObjectStore<TodoListItem>>()

  //#region ------------------- subscribe to xdb's onChange -------------------
  useAsyncEffect(async () => {
    const objectStore = await getXDBObjectStore<TodoListItem>({
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

  const deleteTodoItem = (info: { item: TodoListItem }) => {
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
    todoList,
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
