import { Button, Col, createKit, Grid, Group, Image, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useDirHandleTrigger } from '../hooks/useDirHandleTrigger'
import { useFileHandle } from '../hooks/useFileHandle'
import { useHandleBreadcrumb } from '../hooks/useHandleBreadcrumb'
import { WebFileWatcherProps } from '../type'
import { FileTree } from './FileTree'

export const FileWatcherBox = createKit('FileWatcherBox', (props: WebFileWatcherProps) => {
  const { rootDirHandle, triggerDirPicker } = useDirHandleTrigger()
  const { breadcrumbList } = useHandleBreadcrumb({ root: rootDirHandle })
  const { url: urlType, type: fileType, setFileHandle } = useFileHandle()

  return (
    <Grid icss={{ gridTemplateColumns: '2fr 1fr', height: '100%', padding: 8, gap: 4 }}>
      <Col icss={{ contain: 'size' }}>
        <Button plugin={autoFocus} onClick={triggerDirPicker}>
          Pick directory
        </Button>
        <Row>Path: {breadcrumbList.join(' > ')}</Row>
        <FileTree rootDirHandle={rootDirHandle} onOpenFile={setFileHandle}></FileTree>
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
