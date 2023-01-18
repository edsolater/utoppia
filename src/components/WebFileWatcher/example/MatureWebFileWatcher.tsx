import { Row } from '@edsolater/uikit'
import { FileWatcher } from '..'
import { useXDBList } from './dataHooks'

// should be a `<WebFileWatcher>` component

export function MatureWebFileWatcher() {
  const { webFileWatcher, insertTodoItem, deleteTodoItem, clear, undo, redo } = useXDBList()

  return (
    <Row icss={{ justifyContent: 'center' }}>
      <FileWatcher
        items={webFileWatcher}
        getItemKey={({ item }) => item.createAt.getTime()}
        onInsert={(text) => {
          insertTodoItem({ todoTitle: text })
        }}
        onDeleteItem={(item) => {
          deleteTodoItem({ item })
        }}
        onClickClearBtn={clear}
        onUndo={undo}
        onRedo={redo}
      />
    </Row>
  )
}

