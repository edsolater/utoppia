import { MayEnum } from '@edsolater/fnkit'
import { useAsyncMemo } from '@edsolater/uikit/hooks'
import { useState } from 'react'

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

  const url = useAsyncMemo(async () => {
    if (!fileHandle) return undefined
    const file = await fileHandle.getFile()
    return URL.createObjectURL(file)
  }, [fileHandle])

  const { type, mimeType } =
    useAsyncMemo(async () => {
      if (!fileHandle) return undefined
      const file = await fileHandle.getFile()
      const mimeType = file.type as MIMEType
      const type = mimeType.startsWith('video')
        ? 'video'
        : mimeType.startsWith('image')
        ? 'image'
        : mimeType.startsWith('audio')
        ? 'audio'
        : 'unknown'
      return { type, mimeType } as const
    }, [fileHandle]) ?? {}

  return { url, type, mimeType, setFileHandle }
}
