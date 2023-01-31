/**
 * check if handle has permission by USER, if not, popup a panel for authorization
 * @param fileHandle handle to be checked
 * @param options FileSystemHandlePermissionDescriptor
 * @returns check result
 */
export async function verifyPermission(
  fileHandle: FileSystemHandle,
  options?: FileSystemHandlePermissionDescriptor
): Promise<boolean> {
  // Check if permission was already granted. If so, return true.
  if ((await fileHandle.queryPermission(options)) === 'granted') {
    return true
  }
  // Request permission. If the user grants permission, return true.
  if ((await fileHandle.requestPermission(options)) === 'granted') {
    return true
  }
  // The user didn't grant permission, so return false.
  return false
}
