/**
 * utils
 */
export function checkUrl(url: string): { isValid: boolean } & Partial<URL> {
  try {
    const urlObj = new URL(url)
    return { isValid: true, ...urlObj }
  } catch {
    return { isValid: false }
  }
}
