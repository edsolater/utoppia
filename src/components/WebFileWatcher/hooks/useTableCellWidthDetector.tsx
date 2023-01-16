import { createCallbackRef } from '@edsolater/uikit/hooks'
import produce from 'immer'
import { RefObject, useState } from 'react'

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
export function useTableCellWidthDetector(options?: {
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
