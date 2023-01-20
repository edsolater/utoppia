import { useState } from 'react'
import { getDirectoryHandle } from '../utils/getDirectoryHandle'

export function useDirectoryHandle() {
  const [rootDirectoryHandle, setRootDirectoryHandle] = useState<FileSystemDirectoryHandle>()
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>()

  async function triggerRootDirectoryPicker() {
    const dirHandle = await getDirectoryHandle()
    setDirectoryHandle(dirHandle)
  }

  return { directoryHandle, triggerRootDirectoryPicker, setDirectoryHandle }
}
