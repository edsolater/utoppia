import { useState } from 'react'
import { pickSystemDirectory } from '../utils/pickSystemDirectory'

export function useDirectoryHandle() {
  const [rootDirectoryHandle, setRootDirectoryHandle] = useState<FileSystemDirectoryHandle>()
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>()

  async function triggerRootDirectoryPicker() {
    const dirHandle = await pickSystemDirectory()
    setDirectoryHandle(dirHandle)
  }

  return { directoryHandle, triggerRootDirectoryPicker, setDirectoryHandle }
}
