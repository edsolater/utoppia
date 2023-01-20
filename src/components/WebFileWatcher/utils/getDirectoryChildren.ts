export async function getDirectoryChildren(dirHandle: FileSystemDirectoryHandle | undefined) {
  if (!dirHandle)
    return [];
  const pairs = [] as (FileSystemDirectoryHandle | FileSystemFileHandle)[];
  for await (const [key, value] of dirHandle.entries()) {
    pairs.push(value);
  }
  return pairs;
}
