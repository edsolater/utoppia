import {
  ItemBox,
  Loop,
  Panel,
  createDomRef,
  cssVar,
  getElementFromRef,
  icssCardPanel,
  icssClickable,
  useClickOutside,
  useKitProps,
  useShortcutsRegister,
  type ElementRef,
  type ItemEventUtils,
  type KitProps,
  type PivChild,
  type SelectableItem,
} from "@edsolater/pivkit"
import { createEffect, createSignal, onMount } from "solid-js"
import { useSelectItems } from "@edsolater/pivkit"

export type SelectPanelProps<T extends SelectableItem> = {
  /** also in controller */
  name?: string

  // variant?: 'filled' | 'filledFlowDark' | 'filledDark' | 'roundedFilledFlowDark' | 'roundedFilledDark'
  items?: T[]
  value?: T
  defaultValue?: T
  /** value is used in onChange, value is also used as key */
  getItemValue?: (item: T) => string | number
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
  const { item, items, index, utils, setItem, focusItem, selectPrevItem, selectNextItem } = useSelectItems<T>({
    items: props.items,
    defaultValue: props.defaultValue,
    getItemValue: methods.getItemValue,
    onChange: methods.onChange,
  })

  // compute render functions
  const renderItem = methods.renderItem ?? (({ value }) => <>{value()}</>)

  const { isFocus } = useElementState(dom)

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
    methods.onClose?.()
  }

  // click outside to close popover
  useClickOutside(dom, {
    onClickOutSide: () => methods.onClose?.(),
  })

  return (
    <Panel domRef={setDom} shadowProps={shadowProps} icss={[icssCardPanel, { padding: "revert", paddingBlock: "8px" }]}>
      <Loop items={items}>
        {(i, idx) => {
          const isSelected = () => i === item()
          const itemValue = () => utils.getItemValue(i)
          return (
            <ItemBox
              onClick={(c) => onItemClick(c, i)}
              icss={[
                icssClickable,
                {
                  padding: "4px 8px",
                  margin: "4px 4px",
                  borderRadius: "4px",
                  background: isSelected() ? cssVar("--item-selected-bg", "#fff4") : undefined,
                  boxShadow: isSelected() ? cssVar("--item-selected-shadow", "0 0 0 4px #fff4") : undefined,
                  color: isSelected() ? cssVar("--select-active-item-text-color", "#c8d7e0") : undefined,
                },
              ]}
            >
              {renderItem({
                item: () => i,
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
function useElementState(dom: ElementRef) {
  const [isFocus, setIsFocus] = createSignal(false)
  createEffect(() => {
    const element = getElementFromRef(dom)
    if (element) {
      element.addEventListener("focus", () => {
        setIsFocus(true)
      })
      element.addEventListener("blur", () => {
        setIsFocus(false)
      })
    }
  })
  return { isFocus }
}
