import { Button, createKit, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useEffect, useState } from 'react'
import { getDirectoryEntries } from '../utils/getDirectoryEntries'
import { getDirectoryHandle } from '../utils/getDirectoryHandle'
import { ListTable } from './ListTable'

export type WebFileWatcherProps = {}

export type FileSystemItemPair = {
  filename: string
  value: FileSystemFileHandle | FileSystemDirectoryHandle
}

export const WebFileWatcher = createKit('WebFileWatcher', (props: WebFileWatcherProps) => {
  const [rootDirHandle, setRootDirHandle] = useState<FileSystemDirectoryHandle>()
  const [breadcrumbList, setBreadcrumbList] = useState<string[]>([])
  useEffect(() => {
    if (rootDirHandle) setBreadcrumbList([rootDirHandle.name])
  }, [rootDirHandle])
  return (
    <>
      <Button
        plugin={autoFocus}
        onClick={async () => {
          const dirHandle = await getDirectoryHandle()
          setRootDirHandle(dirHandle)
        }}
      >
        Pick directory
      </Button>
      <Row>Path: {breadcrumbList.join(' > ')}</Row>
      <ListTable items={getDirectoryEntries(rootDirHandle)} />
    </>
  )
})
