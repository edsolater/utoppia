import { MayEnum } from '@edsolater/fnkit'
import { useAsyncMemo } from '@edsolater/uikit/hooks'
import { useLayoutEffect, useState } from 'react'

export type MIMEType =
  /* TODO：complete this */
  MayEnum<
    | 'image/apng' // Animated Portable Network Graphics (APNG)
    | 'image/avif' // AV1 Image File Format (AVIF)
    | 'image/gif' // Graphics Interchange Format (GIF)
    | 'image/jpeg' // Joint Photographic Expert Group image (JPEG)
    | 'image/png' // Portable Network Graphics (PNG)
    | 'image/svg+xml' // Scalable Vector Graphics (SVG)
    | 'image/webp' // Web Picture format (WEBP)
  >

export type FileType = 'video' | 'image' | 'audio' | 'unknown'

export function useFileHandle(options?: { /* usually it's default */ fileHandle?: FileSystemFileHandle }) {
  const [fileHandle, setFileHandle] = useState(options?.fileHandle)

  useLayoutEffect(() => {
    if (options?.fileHandle) setFileHandle(options.fileHandle)
  }, [options?.fileHandle])

  const file = useAsyncMemo(() => fileHandle?.getFile(), [fileHandle])

  const url = useAsyncMemo(() => getFileUrl(fileHandle), [fileHandle])

  const { type, mimeType } = useAsyncMemo(() => getFileType(file), [file]) ?? {}

  const { width: imageWidth, height: imageHeight } =
    useAsyncMemo(async () => (url && type === 'image' ? getImageSize(url) : undefined), [url, type]) ?? {}

  return {
    url,
    type,
    name: fileHandle?.name,
    lastModified: file?.lastModified,
    size: file?.size,

    /** only if file is image */
    imageWidth,
    imageHeight,

    mimeType,
    setFileHandle
  }
}

async function getFileUrl(handle: FileSystemFileHandle | undefined): Promise<string | undefined> {
  if (!handle) return undefined
  const file = await handle.getFile()
  return URL.createObjectURL(file)
}

async function getFileType(
  file: File | undefined
): Promise<{ type: 'video' | 'image' | 'audio' | 'unknown'; mimeType: MIMEType } | undefined> {
  if (!file) return
  const mimeType = file.type as MIMEType
  const type = mimeType.startsWith('video')
    ? 'video'
    : mimeType.startsWith('image')
    ? 'image'
    : mimeType.startsWith('audio')
    ? 'audio'
    : 'unknown'
  return { type, mimeType } as const
}

async function getImageSize(url: string): Promise<{ width: number; height: number } | undefined> {
  const inBrowser = 'document' in globalThis
  if (!inBrowser) return
  return new Promise((resolve) => {
    const imageEl = document.createElement('img')
    imageEl.src = url
    imageEl.addEventListener('load', (el) => {
      resolve({ width: imageEl.naturalWidth, height: imageEl.naturalHeight })
    })
  })
}
