import { Button, Col, createKit, Grid, Group, Image, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useDirHandleTrigger } from '../hooks/useDirHandleTrigger'
import { useFileHandle } from '../hooks/useFileHandle'
import { useHandleBreadcrumb } from '../hooks/useHandleBreadcrumb'
import { WebFileWatcherProps } from '../type'
import { getDirectoryEntries } from '../utils/getDirectoryEntries'
import { FileWatcherList } from './FileWatcherList'
export const FileWatcher = createKit('FileWatcher', (props: WebFileWatcherProps) => {
  const { rootDirHandle, triggerDirPicker } = useDirHandleTrigger()
  const { url: urlType, type: fileType, setFileHandle } = useFileHandle()
  const { breadcrumbList } = useHandleBreadcrumb({ root: rootDirHandle })

  return (
    <Grid icss={{ gridTemplateColumns: '1fr 1fr', height: '100%' }}>
      <Col icss={{ contain: 'size' }}>
        <Button plugin={autoFocus} onClick={triggerDirPicker}>
          Pick directory
        </Button>
        <Row>Path: {breadcrumbList.join(' > ')}</Row>
        <FileWatcherList
          icss={{ flex: 1, overflow: 'overlay' }}
          pairs={getDirectoryEntries(rootDirHandle)}
          onOpenFile={setFileHandle}
        ></FileWatcherList>
      </Col>
      {/* TODO: add <InnerBox> to handle `height: 100%` and `overflow: overlay`  */}
      <Group name='preview' icss={{ overflow: 'overlay' }}>
        {fileType === 'image' && urlType ? (
          <Image icss={{ width: '100%' }} src={urlType} />
        ) : fileType === 'video' && urlType ? (
          <video controls style={{ width: '100%' }} src={urlType} />
        ) : fileType === 'audio' && urlType ? (
          <audio style={{ width: '100%' }} src={urlType} />
        ) : (
          '[preview panel]'
        )}
      </Group>
    </Grid>
  )
})
