import { isObject } from '@edsolater/fnkit'

export function isFileHandle(handle: any): handle is FileSystemHandle {
  return isObject(handle) && handle instanceof window.FileSystemFileHandle
}

export function isDirectoryHandle(handle: any): handle is FileSystemDirectoryHandle {
  return isObject(handle) && handle instanceof window.FileSystemDirectoryHandle
}
