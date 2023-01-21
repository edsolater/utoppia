import { Button, Col, createKit, Div, For, Grid, Group, Image, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useMemo } from 'react'
import { useFileSystem } from '../hooks/useFileSystem'
import { WebFileWatcherProps } from '../type'
import { FileWatcherList } from './FileWatcherList'

export const FileWatcherBox = createKit('FileWatcherBox', (props: WebFileWatcherProps) => {
  const {
    currentDirectoryHandle,
    activeFileHandle,
    triggerRootDirectoryPicker,
    setCurrentDirectoryHandle,
    addHandle,
    navBack,
    breadcrumbList,
    canNavBack,
    url: urlType,
    type: fileType
  } = useFileSystem()

  const filcss = useMemo(
    () => ({
      flex: 1,
      overflow: 'overlay'
    }),
    []
  ) // JSS cause re-render
  return (
    <Grid icss={{ gridTemplateColumns: '2fr 1fr', height: '100%', padding: 8, gap: 4 }}>
      <Col icss={{ contain: 'size' }}>
        <Button plugin={autoFocus} onClick={triggerRootDirectoryPicker}>
          Pick directory
        </Button>
        {canNavBack && <Button onClick={navBack}>Go back</Button>}

        <Row renderSpaceEl={<Div>{'>'}</Div>}>
          <For each={breadcrumbList}>
            {(item) => (
              <Div
                icss={{ textDecoration: 'underline' }}
                onClick={() => {
                  setCurrentDirectoryHandle(item)
                }}
              >
                {item.name}
              </Div>
            )}
          </For>
        </Row>

        {currentDirectoryHandle && (
          <FileWatcherList
            icss={filcss}
            root={currentDirectoryHandle}
            onOpenFile={addHandle}
            onOpenDirectory={addHandle}
          />
        )}
      </Col>

      {/* TODO: add <InnerBox> to handle `height: 100%` and `overflow: overlay`  */}
      <Group name='preview' icss={{ overflow: 'overlay' }}>
        {/* active filename */}
        <Div>{activeFileHandle?.name}</Div>

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
