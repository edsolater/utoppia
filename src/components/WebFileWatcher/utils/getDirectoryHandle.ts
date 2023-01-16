
export async function getDirectoryHandle() {
  const dirHandle = await showDirectoryPicker({});
  return dirHandle;
}
