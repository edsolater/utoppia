export async function pickSystemDirectory() {
  const dirHandle = await showDirectoryPicker({})
  return dirHandle
}
