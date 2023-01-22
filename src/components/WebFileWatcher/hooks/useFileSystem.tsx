import { TreeStructure, tryCatch } from '@edsolater/fnkit'
import { useEvent, useForceUpdate } from '@edsolater/uikit/hooks'
import { useMemo, useRef, useState } from 'react'
import { isDirectoryHandle, isFileHandle } from '../utils/adjest'
import { pickSystemDirectory, PickSystemDirectoryOptions } from '../utils/pickSystemDirectory'

export function useFileSystem(options?: { triggerOptions?: PickSystemDirectoryOptions }) {
  const [forceUpdateCount, forceUpdate] = useForceUpdate()
  const tree = useRef(new TreeStructure<FileSystemHandle>())
  const root = useMemo(() => tree.current.rootNode?.info, [forceUpdateCount])
  const [currentDirectoryHandle, setCurrentDirectoryHandle] = useState<FileSystemDirectoryHandle>()
  const breadcrumbList = useMemo(
    () =>
      currentDirectoryHandle &&
      tryCatch(() => tree.current.getPathFromRoot(currentDirectoryHandle).filter(isDirectoryHandle)),
    [currentDirectoryHandle, root, forceUpdateCount]
  )
  const [activeFileHandle, setActiveFileHandle] = useState<FileSystemFileHandle>()

  const triggerRootDirectoryPicker = useEvent(async () => {
    const root = await pickSystemDirectory(options?.triggerOptions)
    tree.current.setRoot(root)
    setCurrentDirectoryHandle(root)
  })

  const addHandle = useEvent(
    async (
      handle: FileSystemFileHandle | FileSystemDirectoryHandle,
      parent: FileSystemFileHandle | FileSystemDirectoryHandle
    ) => {
      if (isFileHandle(handle)) {
        setActiveFileHandle(handle)
      } else {
        setCurrentDirectoryHandle(handle)
      }
      tree.current.addNode(handle, parent)
    }
  )

  const navBack = useEvent(async () => {
    const newLast = breadcrumbList?.at(-2)
    isDirectoryHandle(newLast) && setCurrentDirectoryHandle(newLast)
  })

  const canNavBack = Number(breadcrumbList?.length) >= 2

  return {
    currentDirectoryHandle,
    activeFileHandle,
    breadcrumbList,
    triggerRootDirectoryPicker,
    setCurrentDirectoryHandle,
    addHandle,
    navBack,
    canNavBack
  }
}
