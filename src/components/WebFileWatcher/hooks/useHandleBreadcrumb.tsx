import { useEffect, useState } from 'react'

export function useHandleBreadcrumb({ root }: { root: FileSystemDirectoryHandle | undefined }) {
  const [breadcrumbList, setBreadcrumbList] = useState<string[]>([])

  useEffect(() => {
    if (root) setBreadcrumbList([root.name])
  }, [root])

  return { breadcrumbList }
}
