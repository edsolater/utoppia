import { MayEnum, TreeStructure, tryCatch } from '@edsolater/fnkit'
import { useAsyncMemo, useEvent, useForceUpdate } from '@edsolater/uikit/hooks'
import { useMemo, useRef, useState } from 'react'
import { isDirectoryHandle, isFileHandle } from '../utils/adjest'
import { getDirectoryHandle } from '../utils/getDirectoryHandle'

type MIMEType =
  /* TODO：complete this */
  MayEnum<
    | 'image/apng' //Animated Portable Network Graphics (APNG)
    | 'image/avif' //AV1 Image File Format (AVIF)
    | 'image/gif' //Graphics Interchange Format (GIF)
    | 'image/jpeg' //Joint Photographic Expert Group image (JPEG)
    | 'image/png' //Portable Network Graphics (PNG)
    | 'image/svg+xml' //Scalable Vector Graphics (SVG)
    | 'image/webp' //Web Picture format (WEBP)
  >

export function useFileSystem() {
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
    const root = await getDirectoryHandle()
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

  const url = useAsyncMemo(async () => {
    if (!activeFileHandle) return undefined
    const file = await activeFileHandle.getFile()
    return URL.createObjectURL(file)
  }, [activeFileHandle])

  const { type, mimeType } =
    useAsyncMemo(async () => {
      if (!activeFileHandle) return undefined
      const file = await activeFileHandle.getFile()
      const mimeType = file.type as MIMEType
      const type = mimeType.startsWith('video')
        ? 'video'
        : mimeType.startsWith('image')
        ? 'image'
        : mimeType.startsWith('audio')
        ? 'audio'
        : 'unknown'
      return { type, mimeType } as const
    }, [activeFileHandle]) ?? {}

  return {
    currentDirectoryHandle,
    activeFileHandle,
    breadcrumbList,
    url,
    type,
    mimeType,
    triggerRootDirectoryPicker,
    setCurrentDirectoryHandle,
    addHandle,
    navBack,
    canNavBack
  }
}
