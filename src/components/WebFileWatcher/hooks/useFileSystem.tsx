import { assert, TreeStructure, tryCatch } from '@edsolater/fnkit'
import { useEvent, useForceUpdate } from '@edsolater/uikit/hooks'
import { useMemo, useRef, useState } from 'react'
import { FileSystemHandleView } from '../type'
import { isDirectoryHandle, isFileHandle, isHandleRoot } from '../utils/judge'
import { PickSystemDirectoryOptions } from '../utils/pickSystemDirectory'
import { getFileSystemHandleView } from '../utils/getFileSystemHandleView'
import { triggerDirectoryPicker } from '../utils/triggerDirectoryPicker'

export function useFileSystem(options?: { triggerOptions?: PickSystemDirectoryOptions }) {
  const [forceUpdateCount, forceUpdate] = useForceUpdate()

  // store file expleror structure
  const tree = useRef(new TreeStructure<FileSystemHandleView>())

  /**
   * directory handle and directory handle info
   */
  const [currentDirectoryHandleInfo, setCurrentDirectoryHandleView] = useState<FileSystemHandleView>()
  const setCurrentDirectoryHandle = useEvent((handle: FileSystemDirectoryHandle) => {
    const fileInfo = getFileSystemHandleView(handle)
    setCurrentDirectoryHandleView(fileInfo)
  })
  const currentDirectoryHandle = useMemo<FileSystemDirectoryHandle | undefined>(
    () => (isDirectoryHandle(currentDirectoryHandleInfo?.handle) ? currentDirectoryHandleInfo?.handle : undefined),
    [currentDirectoryHandleInfo]
  )

  /**
   * file handle and file handle info
   */
  const [activeFileHandleInfo, setActiveFileHandleInfo] = useState<FileSystemHandleView>()
  const setActiveFileHandle = useEvent((handle: FileSystemFileHandle) => {
    const fileInfo = getFileSystemHandleView(handle)
    setActiveFileHandleInfo(fileInfo)
  })
  const activeFileHandle = useMemo<FileSystemFileHandle | undefined>(
    () => (isFileHandle(activeFileHandleInfo?.handle) ? activeFileHandleInfo?.handle : undefined),
    [activeFileHandleInfo]
  )

  /**
   * pick root
   */
  const triggerRootDirectoryPicker = useEvent(async () => {
    const root = await triggerDirectoryPicker({ triggerOptions: options?.triggerOptions })
    if (!isHandleRoot(root)) console.warn(`prefer root (such as F:\\), but get ${root.name}`)
    const rootSystemHandleView = getFileSystemHandleView(root)
    tree.current.setRoot(rootSystemHandleView)
    setCurrentDirectoryHandleView(rootSystemHandleView)
  })

  const breadcrumbList = useMemo(
    () =>
      currentDirectoryHandleInfo &&
      tryCatch(() =>
        tree.current.getPathFromRoot(currentDirectoryHandleInfo).filter((i) => isDirectoryHandle(i.handle))
      ),
    [currentDirectoryHandleInfo, forceUpdateCount]
  )

  const addHandle = useEvent(
    async (
      handle: FileSystemFileHandle | FileSystemDirectoryHandle,
      parent: FileSystemFileHandle | FileSystemDirectoryHandle
    ) => {
      const handleView = getFileSystemHandleView(handle)
      const parentHandleView = getFileSystemHandleView(parent)
      if (isFileHandle(handleView.handle)) {
        setActiveFileHandle(handleView.handle)
      } else {
        setCurrentDirectoryHandleView(handleView)
      }
      tree.current.addNode(handleView, parentHandleView)
    }
  )

  const navBack = useEvent(async () => {
    const newLast = breadcrumbList?.at(-2)
    if (!newLast) return
    isDirectoryHandle(newLast.handle) && setCurrentDirectoryHandle(newLast.handle)
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
