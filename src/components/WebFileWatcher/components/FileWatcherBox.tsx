import { Button, Col, createKit, Div, For, Grid, Group, Row } from '@edsolater/uikit'
import { autoFocus } from '@edsolater/uikit/plugins'
import { useMemo } from 'react'
import { useFileSystem } from '../hooks/useFileSystem'
import { WebFileWatcherProps } from '../type'
import { HandleList } from './HandleList'
import { PreviewPanel } from './PreviewPanel'

export const FileWatcherBox = createKit('FileWatcherBox', (props: WebFileWatcherProps) => {
  const {
    currentDirectoryHandle,
    activeFileHandle,
    triggerRootDirectoryPicker,
    setCurrentDirectoryHandle,
    addHandle,
    navBack,
    breadcrumbList,
    canNavBack
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
        <Row>
          <Button plugin={autoFocus} onClick={triggerRootDirectoryPicker}>
            Pick directory
          </Button>
          {canNavBack && <Button onClick={navBack}>Go back</Button>}
        </Row>

        <Row>
          <For each={breadcrumbList} renderGap={<Div>{'>'}</Div>}>
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
          <HandleList
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
        <PreviewPanel handle={activeFileHandle} />
      </Group>
    </Grid>
  )
})


