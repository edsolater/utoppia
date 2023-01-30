import { FileSystemHandleView } from '../type'

// cache store for FileHandleInfo, so handle -> fileHandleInfo will be unique
const fileSystemObjectCache = new WeakMap<FileSystemHandle, FileSystemHandleView>()

export function getFileSystemHandleView(handle: FileSystemHandle) {
  if (!fileSystemObjectCache.has(handle)) {
    const systemObject: FileSystemHandleView = { handle }
    fileSystemObjectCache.set(handle, systemObject)
  }
  return fileSystemObjectCache.get(handle)!
}
