export interface PickSystemDirectoryOptions {
  id: string
  mode: 'read' | 'readwrite'
  startIn: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos'
}

/**
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker#parameters
 * @returns
 */
export async function pickSystemDirectory(options?: PickSystemDirectoryOptions) {
  const dirHandle = await showDirectoryPicker(options ?? {})
  return dirHandle
}
