import { MayPromise } from '@edsolater/fnkit'
import { Button, createKit, Div, DivChildNode, Group, Row, Image, Grid } from '@edsolater/uikit'
import { useAsyncEffect, useToggle } from '@edsolater/uikit/hooks'
import { autoFocus } from '@edsolater/uikit/plugins'
import { isFileHandle, isFileOrDirectoryHandle } from '../utils/adjest'
import { getDirectoryEntries } from '../utils/getDirectoryEntries'
import { ListTable } from './BasicListTable'
import { useHandleBreadcrumb } from '../hooks/useHandleBreadcrumb'
import { useWebDirHandle } from '../hooks/useWebDirHandle'
import { FileSystemItemPair, WebFileWatcherProps } from '../type'
import { ComponentProps, useEffect, useState } from 'react'

export const WebFileWatcher = createKit('WebFileWatcher', (props: WebFileWatcherProps) => {
  const { rootDirHandle, triggerDirPicker } = useWebDirHandle()
  const [shouldPreviewFileHandle, setShouldPreviewFileHandle] = useState<FileSystemFileHandle>()
  const [fileUrl, setFileUrl] = useState<string>()

  const { breadcrumbList } = useHandleBreadcrumb({ root: rootDirHandle })
  useAsyncEffect(async () => {
    console.log(shouldPreviewFileHandle)
    if (!shouldPreviewFileHandle) return
    const file = await shouldPreviewFileHandle.getFile()
    const fileUrl = URL.createObjectURL(file)
    setFileUrl(fileUrl)
  }, [shouldPreviewFileHandle])
  return (
    <Grid icss={{ gridTemplateColumns: '1fr 1fr' }}>
      <Div>
        <Button plugin={autoFocus} onClick={triggerDirPicker}>
          Pick directory
        </Button>
        <Row>Path: {breadcrumbList.join(' > ')}</Row>
        <FileWatcherList
          pairs={getDirectoryEntries(rootDirHandle)}
          onOpenFile={() => {
            console.count('uyt') // FIXME not invoke
          }}
        ></FileWatcherList>
      </Div>
      <Group name='preview'>{fileUrl ? <Image src={fileUrl} /> : '[preview panel]'}</Group>
    </Grid>
  )
})

function FileWatcherList(props: {
  pairs: MayPromise<FileSystemItemPair[]>
  noHeader?: boolean
  onOpenFile?: ComponentProps<typeof FilenameItemFilenameCell>['onOpenFile']
}) {
  return (
    <ListTable
      items={props.pairs}
      showHeader={!props.noHeader}
      anatomy={{
        itemRow: {
          icss: {
            alignItems: 'start'
          }
        },
        renderItemCell: ({ value, key, item }) =>
          key === 'filename' ? (
            isFileOrDirectoryHandle(item.value) ? (
              isFileHandle(item.value) ? (
                <FilenameItemFilenameCell onOpenFile={props.onOpenFile} handler={item.value} />
              ) : (
                <Div>{item.filename}</Div> //TODO <-- use <Text>
              )
            ) : (
              String(value)
            )
          ) : isFileOrDirectoryHandle(item.value) ? (
            isFileHandle(item.value) ? null : (
              <DirectoryItemValueCell onOpenFile={props.onOpenFile} handler={item.value} />
            )
          ) : (
            String(value)
          )
      }}
    />
  )
}

const FilenameItemFilenameCell = createKit(
  'FilenameItemFilenameCell',
  ({
    handler,
    onOpenFile
  }: {
    handler: FileSystemFileHandle
    onOpenFile?: (fileHandle: FileSystemFileHandle) => void
  }) => {
    return (
      <Div
        icss={{ textDecoration: 'underline' }}
        onClick={() => {
          console.log('1: ', 1)
          onOpenFile?.(handler)
        }}
      >
        {handler.name}
      </Div>
    )
  }
)

function DirectoryItemValueCell({
  handler,
  onOpenFile
}: {
  handler: FileSystemDirectoryHandle
  onOpenFile?: ComponentProps<typeof FilenameItemFilenameCell>['onOpenFile']
}) {
  const [hasToggled, controller] = useToggle()
  return hasToggled ? (
    <FileWatcherList noHeader onOpenFile={onOpenFile} pairs={getDirectoryEntries(handler)} />
  ) : (
    <Div onClick={controller.on}>▶️</Div>
  )
}
