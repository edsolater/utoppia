import { FileSystemDirectoryHandleView } from '../type'

export function useFileSystemDirectoryHandleView(handle: FileSystemDirectoryHandle): FileSystemDirectoryHandleView {
  return { handle, isDirectory: true }
}
