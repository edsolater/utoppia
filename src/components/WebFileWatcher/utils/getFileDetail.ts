import { FileDetail, FileMoreDetail, MIMEType } from '../type'

export async function getFileInfo(handle: FileSystemFileHandle): Promise<FileDetail>
export async function getFileInfo(handle: FileSystemFileHandle | undefined): Promise<FileDetail | undefined>
export async function getFileInfo(handle: FileSystemFileHandle | undefined): Promise<FileDetail | undefined> {
  if (!handle) return undefined
  const file = await handle.getFile()
  const genFileUrl = () => getFileUrl(handle)

  const getMoreFileDetails = async () => {
    const name = handle?.name
    const lastModified = file?.lastModified
    const size = file?.size
    const url = await genFileUrl()
    /** only if file is image */
    const { width: imageWidth, height: imageHeight } =
      (await (url && type === 'image' ? getImageSize(url) : undefined)) ?? {}
    return {
      name,
      lastModified,
      size,
      imageWidth,
      imageHeight
    } satisfies FileMoreDetail
  }

  const name = handle?.name

  const { type, mimeType } = (await getFileType(file)) ?? {}
  const a: FileDetail = { file, type, mimeType, genFileUrl, name, getMoreFileDetails }
  return a
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
