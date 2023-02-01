import { isObject } from '@edsolater/fnkit'
import { FileSystemHandleView } from '../type'

// -------- handle --------
export function isFileHandle(handle: any): handle is FileSystemFileHandle {
  return isObject(handle) && handle instanceof window.FileSystemFileHandle
}

export function isDirectoryHandle(handle: any): handle is FileSystemDirectoryHandle {
  return isObject(handle) && handle instanceof window.FileSystemDirectoryHandle
}

export function isHandle(handle: any): handle is FileSystemFileHandle | FileSystemDirectoryHandle {
  return isFileHandle(handle) || isDirectoryHandle(handle)
}

// -------- handle view --------
export function isFileHandleView(handleView: any): handleView is FileSystemHandleView {
  return isObject(handleView) && 'handle' in handleView && isFileHandle(handleView.handle)
}

export function isDirectoryHandleView(handleView: any): handleView is FileSystemDirectoryHandle {
  return isObject(handleView) && 'handle' in handleView && isDirectoryHandle(handleView.handle)
}

export function isHandleView(
  handleView: any
): handleView is FileSystemFileHandle | FileSystemDirectoryHandle {
  return isFileHandleView(handleView) || isDirectoryHandleView(handleView)
}

// -------- special root directory --------
export function isHandleRoot(handle: any): boolean {
  return isDirectoryHandle(handle) && handle.name === '\\'
}
