import { FileSystemDirectoryHandleView, FileSystemFileHandleView, FileSystemHandleView } from '../type'
import { getFileDetail } from './getFileDetail'
import { isDirectoryHandle, isFileHandle } from './judge'


function makeCached<T extends Function>(fn: T): T {
  const cache = new WeakMap<any, any>()
  return ((...args) => {
    const firstParam = args[0]
    if (!cache.has(firstParam)) {
      const result = fn(...args)
      cache.set(firstParam, result)
    }
    return cache.get(firstParam)!
  }) as unknown as T
}

export const getFileSystemHandleView: {
  (handle: FileSystemDirectoryHandle): FileSystemDirectoryHandleView
  (handle: FileSystemFileHandle): FileSystemFileHandleView
  (handle: FileSystemHandle): FileSystemFileHandleView | FileSystemDirectoryHandleView
} = makeCached((handle: FileSystemHandle) => {
  if (isFileHandle(handle)) {
    const detail = getFileDetail(handle)
    const handleView: FileSystemFileHandleView = { detail, handle, isDirectory: false }
    return handleView
  }
  if (isDirectoryHandle(handle)) {
    const handleView: FileSystemDirectoryHandleView = { handle, isDirectory: true }
    return handleView
  }
  throw 'not file handle or directory handle'
}) as any
