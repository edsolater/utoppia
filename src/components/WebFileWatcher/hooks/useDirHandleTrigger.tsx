import { useState } from 'react'
import { getDirectoryHandle } from '../utils/getDirectoryHandle'

export function useDirHandleTrigger() {
  const [rootDirHandle, setRootDirHandle] = useState<FileSystemDirectoryHandle>()

  async function triggerDirPicker() {
    const dirHandle = await getDirectoryHandle()
    setRootDirHandle(dirHandle)
  }

  return { rootDirHandle, triggerDirPicker }
}
