import { Button, createKit, Grid, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useState } from 'react'
import { ListTable } from './ListTable'

export type WebFileWatcherProps = {}

const getDirectoryHandle = async () => {
  const dirHandle = await showDirectoryPicker({})
  for await (const [key, value] of dirHandle.entries()) {
    console.log({ key, value })
  }
  return dirHandle
}

type FileSystemItemPair = {
  filename: string
  value: FileSystemFileHandle | FileSystemDirectoryHandle
}

const getDirectoryEntries = async (dirHandle: FileSystemDirectoryHandle) => {
  const pairs = [] as FileSystemItemPair[]
  for await (const [key, value] of dirHandle.entries()) {
    pairs.push({ filename: key, value })
  }
  return pairs
}

export const WebFileWatcher = createKit('WebFileWatcher', (props: WebFileWatcherProps) => {
  const [pairs, setPairs] = useState<FileSystemItemPair[]>([])
  return (
    <>
      <Button
        plugin={autoFocus}
        onClick={async () => {
          const dirHandle = await getDirectoryHandle()
          console.log('dirHandle: ', dirHandle)
          const pairs = await getDirectoryEntries(dirHandle)
          console.log('pairs: ', pairs)
          setPairs(pairs)
        }}
      >
        Pick directory
      </Button>

      <ListTable items={pairs} />
    </>
  )
})
