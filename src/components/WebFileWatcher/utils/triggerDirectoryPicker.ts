import { pickSystemDirectory, PickSystemDirectoryOptions } from './pickSystemDirectory'

export async function triggerDirectoryPicker(options?: {
  onSuccess?: (handle: FileSystemDirectoryHandle) => void
  triggerOptions?: PickSystemDirectoryOptions
}) {
  const handle = await pickSystemDirectory(options?.triggerOptions)
  options?.onSuccess?.(handle)
  return handle
}
