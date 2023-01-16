import { isObject, MayPromise } from '@edsolater/fnkit'
import {
  AddProps,
  createKit,
  Div,
  DivProps,
  For,
  GridProps,
  Group,
  GroupProps,
  ICSSObject,
  Row
} from '@edsolater/uikit'
import { createCallbackRef, useAsyncValue } from '@edsolater/uikit/hooks'
import produce from 'immer'
import { RefObject, useState } from 'react'

export type ListTableProps<T extends Record<string, any> = Record<string, any>> = {
  items: MayPromise<T[]>
  getItemKey?: (info: { item: T; idx: number }) => string | number

  // -------- sub --------
  // renderItem?: (info: { item: T }) => DivChildNode
  // renderHeader?: (info: { items: T[]; firstItem?: T }) => DivChildNode

  anatomy?: {
    itemCell?: DivProps
    itemRow?: DivProps
    headerCell?: DivProps
    itemGroup?: GroupProps
    headerGroup?: GridProps
  }
}

export const ListTable = createKit(
  'ListTable',
  <T extends Record<string, any>>({ items: mayPromiseItems, getItemKey, anatomy }: ListTableProps<T>) => {
    const items = useAsyncValue(mayPromiseItems) ?? []
    const itemPropertyNames = getItemsProperties(items)
    console.log('items: ', items)
    const gridICSS: ICSSObject = { display: 'grid', gap: 24, gridTemplateColumns: `1fr 2fr 48px` }
    const { createTabelCellRef, hasDetected, getCellWidth } = useTableCellWidthDetector()
    return (
      <Div>
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

        {/* list */}
        <Group name='list-item-group' shadowProps={anatomy?.itemGroup}>
          <For each={items} getKey={(item, idx) => getItemKey?.({ item, idx })}>
            {(item) => (
              <AddProps shadowProps={anatomy?.itemCell}>
                <Row shadowProps={anatomy?.itemRow} icss={{ marginBlock: 8 }}>
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

type TableCellWidthDetector = {
  createTabelCellRef: (
    colIndex: number,
    options?: {
      ignoreSelfWidth?: boolean
    }
  ) => RefObject<HTMLElement>
  hasDetected: boolean
  getCellWidth(colIndex: number): number | undefined // px
}

/**
 * @todo if cell element is removed/size-changed during process, it should recalc
 * @todo if cell element'children is removed/size-changed during process, it should recalc
 */
function useTableCellWidthDetector(options?: {
  /** use clientWidth but it will only give int not decimal, so have to have additional cell width space */
  /** @deprecated use getBoundingClientRect to have more exact result  */
  additionalCellWidthSpace?: number
}): TableCellWidthDetector {
  const [cellWidth, setCellWidth] = useState([] as number[])

  const hasDetected = cellWidth.length > 0

  function createTabelCellRef(colIndex: number, innerOptions?: { ignoreSelfWidth?: boolean }) {
    const ref = createCallbackRef<HTMLElement>((el) => {
      const w = el.getBoundingClientRect().width + (options?.additionalCellWidthSpace ?? 0)
      setCellWidth((cellWidth) => {
        const isNewBiggerValue = w && w > (cellWidth.at(colIndex) ?? -Infinity)
        return isNewBiggerValue
          ? produce(cellWidth, (draft) => {
              draft[colIndex] = w
            })
          : cellWidth
      })
    })
    return ref
  }

  function getCellWidth(colIndex: number, options?: { /** default 3 */ toFixedNumber?: number }) {
    const { toFixedNumber = 3 } = options ?? {}
    const w = cellWidth.at(colIndex)
    return Number(w?.toFixed(toFixedNumber))
  }

  return { createTabelCellRef, hasDetected, getCellWidth }
}
