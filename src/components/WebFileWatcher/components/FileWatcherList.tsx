import { createKit, Div } from '@edsolater/uikit'
import { useToggle } from '@edsolater/uikit/hooks'
import { ComponentProps } from 'react'
import { isFileHandle } from '../utils/adjest'
import { getDirectoryChildren } from '../utils/getDirectoryChildren'
import { ListTable } from './BasicListTable'

export type FileWatcherListProps = {
  root: FileSystemDirectoryHandle
  onOpenFile?: ComponentProps<typeof FileHandleRow>['onOpenFile']
  onOpenDirectory?: ComponentProps<typeof DirectoryHandleRow>['onOpenDirectory']
}

export const FileWatcherList = createKit(
  { name: 'FileWatcherList', reactMemo: true },
  ({ root, onOpenFile, onOpenDirectory }: FileWatcherListProps) => (
    <ListTable
      items={getDirectoryChildren(root)}
      showHeader={false}
      anatomy={{
        itemRow: {
          icss: {
            alignItems: 'start'
          }
        },
        renderItem: ({ item: handle }) =>
          isFileHandle(handle) ? (
            <FileHandleRow handler={handle} onOpenFile={onOpenFile} />
          ) : (
            <DirectoryHandleRow handler={handle} onOpenDirectory={onOpenDirectory} />
          )
      }}
    />
  )
)

const FileHandleRow = createKit(
  'FilenameItemFilenameCell',
  ({ handler, onOpenFile }: { handler: FileSystemFileHandle; onOpenFile?: (handle: FileSystemFileHandle) => void }) => {
    return (
      <Div
        icss={{ textDecoration: 'underline' }}
        onClick={() => {
          onOpenFile?.(handler)
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
    onOpenDirectory
  }: {
    handler: FileSystemDirectoryHandle
    onOpenDirectory?: (handle: FileSystemDirectoryHandle) => void
  }) => {
    return (
      <Div
        onClick={() => {
          onOpenDirectory?.(handler)
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
