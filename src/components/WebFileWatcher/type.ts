import { MayEnum } from '@edsolater/fnkit'

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
export type WebFileWatcherProps = {}

export type FileSystemItemPair = {
  filename: string
  value: FileSystemFileHandle | FileSystemDirectoryHandle
}
export interface FileInfo {
  file: File
  type: 'video' | 'image' | 'audio' | 'unknown' | undefined
  mimeType: MIMEType | undefined
  genFileUrl: () => Promise<string | undefined>
  name: string
  getFileDetailInfos: () => Promise<FileDetailInfo>
}
export interface FileDetailInfo {
  name: string
  lastModified: number
  size: number
  imageWidth: number | undefined
  imageHeight: number | undefined
}
