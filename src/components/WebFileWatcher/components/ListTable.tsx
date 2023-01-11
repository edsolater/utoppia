import { isObject } from '@edsolater/fnkit'
import { AddProps, createKit, Div, DivChildNode, DivProps, For, Group, ICSSObject, Row } from '@edsolater/uikit'
import { RefObject } from 'react'

export type ListTableProps<T extends Record<string, any> = Record<string, any>> = {
  items: T[]
  getItemKey?: (info: { item: T; idx: number }) => string | number

  // -------- sub --------
  // renderItem?: (info: { item: T }) => DivChildNode
  // renderHeader?: (info: { items: T[]; firstItem?: T }) => DivChildNode

  anatomy?: {
    itemCell?: DivProps
    itemRow?: DivProps
    headerCell?: DivProps
    itemGroup?: DivProps
    headerGroup?: DivProps
  }
}

export const ListTable = createKit(
  'ListTable',
  <T extends Record<string, any>>({ items, getItemKey, anatomy }: ListTableProps<T>) => {
    const itemPropertyNames = getItemsProperties(items)
    const gridICSS: ICSSObject = { display: 'grid', gap: 24, gridTemplateColumns: `1fr 2fr 48px` }
    const { tableRef, createTabelCellRef, hasDetected, getCellWidth } = useTableCellWidthDetector()
    return (
      <Div
        domRef={tableRef}
        icss={items.length && hasDetected ? { border: '1px solid', padding: 4 } : { display: 'none' }}
      >
        {/* header */}
        <Group shadowProps={anatomy?.headerGroup} name='list-header'>
          <Row shadowProps={anatomy?.headerCell}>
            <For each={itemPropertyNames}>
              {(n, idx) => (
                <Div
                  domRef={createTabelCellRef(idx)}
                  icss={{ marginBlock: 4, fontSize: 18, fontWeight: 'bold', width: getCellWidth(idx) }}
                >
                  {n}
                </Div>
              )}
            </For>
          </Row>
        </Group>

        {/* list content */}
        <Group name='list-item-group' shadowProps={anatomy?.itemGroup}>
          <For each={items} getKey={(item, idx) => getItemKey?.({ item, idx })}>
            {(item) => (
              <AddProps shadowProps={anatomy?.itemCell}>
                <Row shadowProps={anatomy?.itemRow} icss={{ marginBlock: 8, background: 'crimson' }}>
                  <For each={Object.values(item)}>
                    {(itemValue, idx) => (
                      <Div
                        icss={{ width: getCellWidth(idx) }}
                        domRef={createTabelCellRef(idx)}
                        shadowProps={anatomy?.itemCell}
                      >
                        {isObject(itemValue) ? '[todo]' : itemValue}
                      </Div>
                    )}
                  </For>
                </Row>
              </AddProps>
            )}
          </For>
        </Group>
      </Div>
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

function useTableCellWidthDetector(): {
  tableRef: RefObject<HTMLElement>
  createTabelCellRef: (colIndex: number) => RefObject<HTMLElement>
  hasDetected: boolean
  getCellWidth(colIndex: number): number | undefined // px
} {
  throw new Error('Function not implemented.')
}
