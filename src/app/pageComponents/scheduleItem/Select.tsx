import {
  ItemBox,
  Loop,
  Panel,
  createDomRef,
  cssVar,
  icssCardPanel,
  icssClickable,
  useClickOutside,
  useKitProps,
  useSelectItems,
  useShortcutsRegister,
  type ItemEventUtils,
  type KitProps,
  type PivChild,
  type SelectableItem,
} from "@edsolater/pivkit"
import { createEffect, createSignal, onMount } from "solid-js"

export type SelectPanelProps<T extends SelectableItem> = {
  /** also in controller */
  name?: string

  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  items?: T[]
  value?: T
  defaultValue?: T
  /** value is used in onChange, value is also used as key */
  getItemValue?: (item: T) => string | number
  canItemClickClose?: boolean
  onChange?(utils: ItemEventUtils<T>): void
  onClose?: () => void

  disabled?: boolean
  placeholder?: PivChild
  renderItem?(utils: ItemEventUtils<T>): PivChild
}
type SelectPanelController = {}
// TODO: imply it !!

export function SelectPanel<T extends SelectableItem>(kitProps: KitProps<SelectPanelProps<T>>) {
  const { props, methods, shadowProps, loadController } = useKitProps(kitProps, { name: "SelectPanel" })

  const { dom, setDom } = createDomRef()

  // controller
  const controller = {} satisfies SelectPanelController
  loadController(controller)

  // items manager
  const { activeItem, items, activeItemIndex, getItemValue, setItem, focusItem, selectPrevItem, selectNextItem } =
    useSelectItems<T>({
      items: props.items,
      defaultValue: props.defaultValue,
      getItemValue: methods.getItemValue,
      onChange: methods.onChange,
    })

  // compute render functions
  const renderItem = methods.renderItem ?? (({ value }) => <>{value()}</>)

  const { isFocus, setDom: setIsFocusedDectectorDomRef } = useElementStateIsFocused()

  // keyboard shortcut
  useShortcutsRegister(
    dom,
    {
      close: {
        action: () => methods.onClose?.(),
        shortcut: "Escape",
      },
      "select confirm": {
        action: () => {
          //TODO: do with focusItem
        },
        shortcut: "Enter",
      },
      "select prev item": {
        action: selectPrevItem,
        shortcut: "ArrowUp",
      },
      "select next item": {
        action: selectNextItem,
        shortcut: "ArrowDown",
      },
    },
    { enabled: isFocus },
  )

  // auto focus when open
  onMount(() => {
    dom()?.focus()
  })

  // handle item click
  const onItemClick = (_clickController, i: T) => {
    setItem(i)
    if (methods.canItemClickClose) {
      methods.onClose?.()
    }
  }

  return (
    <Panel
      domRef={[setDom, setIsFocusedDectectorDomRef]}
      shadowProps={shadowProps}
      icss={[icssCardPanel, { padding: "8px" , borderRadius:'8px'}]}
    >

      
      <Loop items={items}>
        {(item, idx) => {
          const isSelected = () => item === activeItem()
          const itemValue = () => getItemValue(item)
          return (
            <ItemBox
              onClick={(c) => onItemClick(c, item)}
              icss={[
                icssClickable,
                {
                  padding: "4px 8px",
                  margin: "4px 4px",
                  borderRadius: "6px",
                  boxShadow: isSelected() ? cssVar("--item-selected-shadow", "0 0 0 4px #fff4") : undefined,
                },
              ]}
            >
              {renderItem({
                item: () => item,
                index: idx,
                value: itemValue,
                isSelected,
              })}
            </ItemBox>
          )
        }}
      </Loop>
    </Panel>
  )
}

// TODO: should run only when user is required
function useElementStateIsFocused() {
  const { dom, setDom } = createDomRef()
  const [isFocus, setIsFocus] = createSignal(false)
  createEffect(() => {
    const element = dom()
    if (element) {
      element.addEventListener("focus", () => {
        setIsFocus(true)
      })
      element.addEventListener("blur", () => {
        setIsFocus(false)
      })
    }
  })
  return { isFocus, setDom }
}
