import { MayPromise } from '@edsolater/fnkit'
import {
  AddProps,
  Col,
  createKit,
  Div,
  DivChildNode,
  DivProps,
  For,
  GridProps,
  Group,
  GroupProps,
  Row,
  Show
} from '@edsolater/uikit'
import { useAsyncValue } from '@edsolater/uikit/hooks'
import { useTableCellWidthDetector } from '../hooks/useTableCellWidthDetector'

export type ListTableProps<T extends Record<string, any> = Record<string, any>> = {
  items: MayPromise<T[]>
  showHeader?: boolean
  /** let too large height cell have floating key */
  letCellSticky?: boolean
  getItemKey?: (info: { item: T; idx: number }) => string | number

  // -------- sub --------
  // renderHeader?: (info: { items: T[]; firstItem?: T }) => DivChildNode

  anatomy?: {
    renderItemCell?: (info: { item: T; value: T[keyof T]; key: keyof T; idx: number }) => DivChildNode
    itemCell?: DivProps
    itemRow?: DivProps
    headerCell?: DivProps
    itemGroup?: GroupProps
    headerGroup?: GridProps
  }
}

export const ListTable = createKit(
  'ListTable',
  <T extends Record<string, any>>({
    items: mayPromiseItems,
    showHeader = true,
    letCellSticky = true,
    getItemKey,
    anatomy
  }: ListTableProps<T>) => {
    const items = useAsyncValue(mayPromiseItems) ?? []
    const itemPropertyNames = getItemsProperties(items)
    const { createTabelCellRef, hasDetected, getCellWidth } = useTableCellWidthDetector()
    return (
      <Col>
        {/* header */}
        <Show when={showHeader}>
          <Group shadowProps={anatomy?.headerGroup} name='list-header'>
            <Row shadowProps={anatomy?.headerCell}>
              <For each={itemPropertyNames}>
                {(n, idx) => (
                  <Div
                    domRef={createTabelCellRef(idx)}
                    icss={{ paddingBlock: 4, fontSize: 18, fontWeight: 'bold', width: getCellWidth(idx) }}
                  >
                    {n}
                  </Div>
                )}
              </For>
            </Row>
          </Group>
        </Show>

        {/* list */}
        <Group name='list-item-group' shadowProps={anatomy?.itemGroup} icss={{ flex: 1 }}>
          <For each={items} getKey={(item, idx) => getItemKey?.({ item, idx })}>
            {(item) => (
              <AddProps shadowProps={anatomy?.itemCell}>
                <Row
                  shadowProps={anatomy?.itemRow}
                  icss={[letCellSticky && { position: 'relative' }, { paddingBlock: 4 }]}
                >
                  <For each={Object.entries(item)}>
                    {([key, value], idx) => (
                      <AddProps
                        shadowProps={anatomy?.itemCell}
                        icss={[letCellSticky && { position: 'sticky', top: 0 }, { width: getCellWidth(idx) }]}
                        domRef={createTabelCellRef(idx)}
                      >
                        {anatomy?.renderItemCell ? (
                          anatomy.renderItemCell({ idx, item, key, value })
                        ) : (
                          <Div>{String(value)}</Div>
                        )}
                      </AddProps>
                    )}
                  </For>
                </Row>
              </AddProps>
            )}
          </For>
        </Group>
      </Col>
    )
  }
)

/**
 * @example
 * getItemsProperties([{a:1, b:2}, {a:2, c:2}, {a:3, b:3, d:3}]) //=> ['a', 'b', 'c', 'd']
 */
function getItemsProperties(items: Record<string, any>[]) {
  return [...new Set(items.flatMap((i) => Object.keys(i)))]
}