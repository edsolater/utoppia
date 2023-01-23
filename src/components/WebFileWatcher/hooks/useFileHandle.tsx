import { useAsyncMemo } from '@edsolater/uikit/hooks'
import { useLayoutEffect, useState } from 'react'
import { getFileInfo } from '../utils/getFileInfo'

export function useFileHandle(options?: { /* usually it's default */ fileHandle?: FileSystemFileHandle }) {
  const [fileHandle, setFileHandle] = useState(options?.fileHandle)

  useLayoutEffect(() => {
    if (options?.fileHandle) setFileHandle(options.fileHandle)
  }, [options?.fileHandle])

  const { file, genFileUrl, getFileDetailInfos, mimeType, name, type } =
    useAsyncMemo(() => getFileInfo(fileHandle), [fileHandle]) ?? {}
  const url = useAsyncMemo(genFileUrl, [genFileUrl])
  const defaultInfos = useAsyncMemo(getFileDetailInfos, [getFileDetailInfos])
  return {
    name,
    file,
    type,
    mimeType,

    url,
    ...defaultInfos,
    setFileHandle
  }
}
