import { Optional } from '@edsolater/fnkit'
import { useAsyncMemo } from '@edsolater/uikit/hooks'
import { useMemo } from 'react'
import { FileSystemFileHandleView } from '../type'
import { getFileDetail } from '../utils/getFileDetail'

export function useFileSystemFileHandleView(handle: FileSystemFileHandle) {
  const handleView = useMemo(
    () =>
      ({ detail: getFileDetail(handle), handle, isDirectory: false } as Optional<FileSystemFileHandleView, 'detail'>),
    [handle]
  )
  return handleView
}
