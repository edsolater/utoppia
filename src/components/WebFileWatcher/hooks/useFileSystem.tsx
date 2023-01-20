import { assert, MayEnum } from '@edsolater/fnkit'
import { useAsyncMemo, useEvent } from '@edsolater/uikit/hooks'
import produce from 'immer'
import { useEffect, useLayoutEffect, useState } from 'react'
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
  const [root, setRoot] = useState<FileSystemDirectoryHandle>()
  const [breadcrumbList, setBreadcrumbList] = useState<FileSystemDirectoryHandle[]>([])
  const [currentDirectoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>()
  const [activeFileHandle, setFileHandle] = useState<FileSystemFileHandle>()

  const triggerDirPicker = useEvent(async () => {
    const root = await getDirectoryHandle()
    setRoot(root)
    setDirectoryHandle(root)
    setBreadcrumbList([root])
  })

  const addHandle = useEvent(async (handle: FileSystemFileHandle | FileSystemDirectoryHandle) => {
    if (isFileHandle(handle)) {
      setFileHandle(handle)
    } else {
      setDirectoryHandle(handle)
      addHandleToBreadcrumb(handle)
    }
  })

  const addHandleToBreadcrumb = useEvent(async (handle: FileSystemDirectoryHandle) => {
    /**
     * case 0: handle is not child of root ❌
     * case 1: handle is child of root , but not direct child of breadcrumb last Item // TEMP ❌
     * case 2: handle is child of root , and is direct child of breadcrumb last Item
     * case 3: handle is child of root , but it's parent is not in breadcrumb ❌
     */

    assert(root, 'should pick root directory first')
    const relativePath = await root.resolve(handle)
    assert(relativePath, 'handle must be the child of root')

    const lastItem = breadcrumbList.at(-1)
    assert(lastItem, 'breadcrumbList must exist at least one item')

    const isDirectChild = Boolean(await lastItem.resolve(handle))
    assert(isDirectChild, 'currently(to evolve) last item of breadcrumb must be the direct parent of ')

    setBreadcrumbList((b) => [...b, handle])
  })

  const navBack = useEvent(async () => {
    const newLast = breadcrumbList.at(-2)
    isDirectoryHandle(newLast) && setDirectoryHandle(newLast)

    setBreadcrumbList(
      produce(breadcrumbList, (l) => {
        l.pop()
      })
    )
  })

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
    triggerDirPicker,
    addHandle,
    navBack
  }
}
