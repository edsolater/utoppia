import { createKit, Div } from '@edsolater/uikit'
import { ComponentProps } from 'react'
import { useFileSystemDirectoryHandleView } from '../hooks/useFileSystemDirectoryHandleView'
import { useFileSystemFileHandleView } from '../hooks/useFileSystemFileHandleView'
import { FileSystemDirectoryHandleView, FileSystemFileHandleView } from '../type'
import { isFileHandle } from '../utils/judge'
import { ListTable } from './BasicListTable'

export type FileHandleListProps = {
  root: FileSystemDirectoryHandle
  onOpenFile?: ComponentProps<typeof FileRow>['onOpenFile']
  onOpenDirectory?: ComponentProps<typeof DirectoryRow>['onOpenDirectory']
}

export const FileHandleList = createKit(
  { name: 'FileHandleList', reactMemo: true },
  ({ root, onOpenFile, onOpenDirectory }: FileHandleListProps) => (
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
            <FileRow handler={handle} onOpenFile={onOpenFile} />
          ) : (
            <DirectoryRow handler={handle} onOpenDirectory={onOpenDirectory} />
          )
      }}
    />
  )
)

const FileRow = createKit(
  'FileRow',
  ({
    handler,
    onOpenFile
  }: {
    handler: FileSystemFileHandle
    onOpenFile?: (handleView: FileSystemFileHandleView) => void
  }) => {
    const handleView = useFileSystemFileHandleView(handler)
    return (
      <Div
        icss={{ textDecoration: 'underline' }}
        onClick={() => {
          handleView.detail && onOpenFile?.(handleView as FileSystemFileHandleView /* lack type intelligense */)
        }}
      >
        {handler.name}
      </Div>
    )
  }
)

const DirectoryRow = createKit(
  'DirectoryItemValueCell',
  ({
    handler,
    onOpenDirectory
  }: {
    handler: FileSystemDirectoryHandle
    onOpenDirectory?: (handleView: FileSystemDirectoryHandleView) => void
  }) => {
    const handleView = useFileSystemDirectoryHandleView(handler)
    return (
      <Div
        onClick={() => {
          onOpenDirectory?.(handleView)
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
