import { FileSystemItemPair } from "../type"

export async function getDirectoryEntries(dirHandle: FileSystemDirectoryHandle | undefined) {
  if (!dirHandle) return []
  const pairs = [] as FileSystemItemPair[]
  for await (const [key, value] of dirHandle.entries()) {
    pairs.push({ filename: key, value })
  }
  return pairs
}
