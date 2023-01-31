import { isObject } from '@edsolater/fnkit'

export function isFileHandle(handle: any): handle is FileSystemFileHandle {
  return isObject(handle) && handle instanceof window.FileSystemFileHandle
}

export function isDirectoryHandle(handle: any): handle is FileSystemDirectoryHandle {
  return isObject(handle) && handle instanceof window.FileSystemDirectoryHandle
}

export function isFileOrDirectoryHandle(handle: any): handle is FileSystemFileHandle | FileSystemDirectoryHandle {
  return isFileHandle(handle) || isDirectoryHandle(handle)
}

export function isHandleRoot(handle: any): boolean {
  return isDirectoryHandle(handle) && handle.name === '\\'
}
