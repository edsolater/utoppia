import { FileDetailGenerator, FileMoreDetail, MIMEType } from '../type'

export async function getFileDetail(handle: FileSystemFileHandle): Promise<FileDetailGenerator>
export async function getFileDetail(handle: FileSystemFileHandle | undefined): Promise<FileDetailGenerator | undefined>
export async function getFileDetail(handle: FileSystemFileHandle | undefined): Promise<FileDetailGenerator | undefined> {
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
  const a: FileDetailGenerator = { file, type, mimeType, genFileUrl, name, getMoreFileDetails }
  return a
}

/**
 * {@link getFileDetail}'s URL function part
 */
async function getFileUrl(handle: FileSystemFileHandle | undefined): Promise<string | undefined> {
  if (!handle) return undefined
  const file = await handle.getFile()
  return URL.createObjectURL(file)
}

/**
 * {@link getFileDetail}'s function part
 */
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

/**
 * {@link getFileDetail}'s function part
 */
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
