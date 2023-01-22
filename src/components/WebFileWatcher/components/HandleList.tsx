import { createKit, Div } from '@edsolater/uikit'
import { ComponentProps } from 'react'
import { isFileHandle } from '../utils/adjest'
import { ListTable } from './BasicListTable'

export type FileWatcherListProps = {
  root: FileSystemDirectoryHandle
  onOpenFile?: ComponentProps<typeof FileHandleRow>['onOpenFile']
  onOpenDirectory?: ComponentProps<typeof DirectoryHandleRow>['onOpenDirectory']
}

export const HandleList = createKit(
  { name: 'FileWatcherList', reactMemo: true },
  ({ root, onOpenFile, onOpenDirectory }: FileWatcherListProps) => (
    <ListTable
      items={root.values()}
      showHeader={false}
      anatomy={{
        itemRow: {
          icss: {
            alignItems: 'start'
          }
        },
        renderItem: ({ item: handle }) =>
          isFileHandle(handle) ? (
            <FileHandleRow handler={handle} parent={root} onOpenFile={onOpenFile} />
          ) : (
            <DirectoryHandleRow handler={handle} parent={root} onOpenDirectory={onOpenDirectory} />
          )
      }}
    />
  )
)

const FileHandleRow = createKit(
  'FilenameItemFilenameCell',
  ({
    handler,
    parent,
    onOpenFile
  }: {
    handler: FileSystemFileHandle
    parent: FileSystemDirectoryHandle
    onOpenFile?: (handle: FileSystemFileHandle, parent: FileSystemDirectoryHandle) => void
  }) => {
    return (
      <Div
        icss={{ textDecoration: 'underline' }}
        onClick={() => {
          onOpenFile?.(handler, parent)
        }}
      >
        {handler.name}
      </Div>
    )
  }
)
const DirectoryHandleRow = createKit(
  'DirectoryItemValueCell',
  ({
    handler,
    parent,
    onOpenDirectory
  }: {
    handler: FileSystemDirectoryHandle
    parent: FileSystemDirectoryHandle
    onOpenDirectory?: (handle: FileSystemDirectoryHandle, parent: FileSystemDirectoryHandle) => void
  }) => {
    return (
      <Div
        onClick={() => {
          onOpenDirectory?.(handler, parent)
        }}
      >
        {handler.name} ▶️
      </Div>
    )
    // return hasToggled ? (
    //   <FileWatcherList onOpenFile={onOpenFile} root={handler} />
    // ) : (
    //   <Div onClick={controller.on}>▶️</Div>
    // )
  }
)
