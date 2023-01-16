import { MayPromise } from '@edsolater/fnkit'
import { Button, createKit, Div, DivChildNode, Row } from '@edsolater/uikit'
import { useToggle } from '@edsolater/uikit/hooks'
import { autoFocus } from '@edsolater/uikit/plugins'
import { isFileHandle, isFileOrDirectoryHandle } from '../utils/adjest'
import { getDirectoryEntries } from '../utils/getDirectoryEntries'
import { ListTable } from './BasicListTable'
import { useHandleBreadcrumb } from '../hooks/useHandleBreadcrumb'
import { useWebDirHandle } from '../hooks/useWebDirHandle'
import { FileSystemItemPair, WebFileWatcherProps } from '../type'

export const WebFileWatcher = createKit('WebFileWatcher', (props: WebFileWatcherProps) => {
  const { rootDirHandle, triggerDirPicker } = useWebDirHandle()
  const { breadcrumbList } = useHandleBreadcrumb({ root: rootDirHandle })
  return (
    <>
      <Button plugin={autoFocus} onClick={triggerDirPicker}>
        Pick directory
      </Button>
      <Row>Path: {breadcrumbList.join(' > ')}</Row>
      <FileWatcherList pairs={getDirectoryEntries(rootDirHandle)}></FileWatcherList>
    </>
  )
})

function FileWatcherList({ pairs, noHeader }: { pairs: MayPromise<FileSystemItemPair[]>; noHeader?: boolean }) {
  return (
    <ListTable
      items={pairs}
      showHeader={!noHeader}
      anatomy={{
        itemRow: {
          icss: {
            alignItems: 'start'
          }
        },
        renderItemCell: ({ value, key, item }) =>
          key === 'filename' ? (
            isFileOrDirectoryHandle(value) ? (
              isFileHandle(item.value) ? (
                <Div
                  icss={{
                    textDecoration: 'underline'
                  }}
                >
                  {item.filename}
                </Div>
              ) : (
                <Div>{item.filename}</Div>
              )
            ) : (
              value
            )
          ) : isFileOrDirectoryHandle(value) ? (
            isFileHandle(value) ? null : (
              <DirectoryItemCell handler={value} />
            )
          ) : (
            value
          )
      }}
    />
  )
}

const DirectoryItemCell = createKit('DirectoryItemCell', ({ handler }: { handler: FileSystemDirectoryHandle }) => {
  const [hasToggled, controller] = useToggle()
  return hasToggled ? (
    <FileWatcherList noHeader pairs={getDirectoryEntries(handler)} />
  ) : (
    <Div onClick={controller.on}>(click)</Div>
  )
})
