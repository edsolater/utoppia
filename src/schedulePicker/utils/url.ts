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

// TODO: move to domkit
export function navigateToUrl(url: string, options?: {/* new page */ blank?: boolean; }) {
  window.open(url, options?.blank ? "_blank" : "_self");
}
