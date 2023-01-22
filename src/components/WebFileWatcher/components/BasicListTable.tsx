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
import { useIterable } from '@edsolater/uikit/hooks'
import { useTableCellWidthDetector } from '../hooks/useTableCellWidthDetector'

export type ListTableProps<T extends Record<string, any> = Record<string, any>> = {
  items: MayPromise<AsyncIterable<T> | Iterable<T>>
  visiableProterties?: (keyof T)[]
  showHeader?: boolean
  /**
   * let too large height cell have floating key
   * note sticky may cause **performance issue**
   */
  letCellSticky?: boolean
  getItemKey?: (info: { item: T; idx: number }) => string | number

  // -------- sub --------
  // renderHeader?: (info: { items: T[]; firstItem?: T }) => DivChildNode

  anatomy?: {
    /** ItemRow
     * if set this, `renderItemCell` will be ignored
     */
    renderItem?: (info: { item: T; idx: number }) => DivChildNode
    renderItemCell?: (info: {
      item: T
      value: T[keyof T]
      key: keyof T
      itemIdx: number
      cellIdx: number
    }) => DivChildNode
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
    items: iterable,
    showHeader = true,
    letCellSticky = false,
    visiableProterties,
    getItemKey,
    anatomy
  }: ListTableProps<T>) => {
    const items = useIterable(iterable)
    const itemPropertyNames = visiableProterties ?? getItemsProperties(items)
    const { createTabelCellRef, hasDetected, getCellWidth } = useTableCellWidthDetector()
    return (
      <Col>
        {/* header */}
        <Show when={showHeader}>
          <Group shadowProps={anatomy?.headerGroup} name='list-header'>
            <Row shadowProps={anatomy?.headerCell}>
              <For each={itemPropertyNames}>
                {(propertyNames, idx) => (
                  <Div
                    domRef={createTabelCellRef(idx)}
                    icss={{ paddingBlock: 4, fontSize: 18, fontWeight: 'bold', width: getCellWidth(idx) }}
                  >
                    {String(propertyNames)}
                  </Div>
                )}
              </For>
            </Row>
          </Group>
        </Show>

        {/* list */}
        <Group name='list-item-group' shadowProps={anatomy?.itemGroup} icss={{ flex: 1 }}>
          <For each={items} getKey={(item, idx) => getItemKey?.({ item, idx })}>
            {(item, itemIdx) =>
              anatomy?.renderItem ? (
                <>{anatomy.renderItem({ item, idx: itemIdx })}</>
              ) : (
                <Row
                  shadowProps={anatomy?.itemRow}
                  icss={[letCellSticky && { position: 'relative' }, { paddingBlock: 4 }]}
                >
                  <For
                    each={
                      /* visiablePropertyPairs */
                      Object.entries(item).filter(([propertyName]) => itemPropertyNames.includes(propertyName))
                    }
                  >
                    {([propertyName, value], cellIdx) => (
                      <AddProps
                        shadowProps={anatomy?.itemCell}
                        icss={[letCellSticky && { position: 'sticky', top: 0 }, { width: getCellWidth(cellIdx) }]}
                        domRef={createTabelCellRef(cellIdx)}
                      >
                        {anatomy?.renderItemCell ? (
                          anatomy.renderItemCell({ item, key: propertyName, value, itemIdx, cellIdx })
                        ) : (
                          <Div>{String(value)}</Div>
                        )}
                      </AddProps>
                    )}
                  </For>
                </Row>
              )
            }
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
