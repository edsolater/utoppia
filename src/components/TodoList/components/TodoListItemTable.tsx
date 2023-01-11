import { createKit, Div, For, Icon, ICSS, Tooltip } from '@edsolater/uikit'
import { click, Kit } from '@edsolater/uikit/plugins'
import { ItemsListBasic, ItemsListBasicProps } from './ItemsDisplayer'
import { stringify } from '../../../utils/stringify'

export type TodoListDisplayerProps<Item extends Record<string, any>> = {
  items: ItemsListBasicProps<Item>['items']
  layoutType?: 'table'
  getItemKey?: ItemsListBasicProps<Item>['getItemKey']
  onDeleteItem?: (item: Item) => void
  onClickClearBtn?: () => void
} & Partial<
  Pick<
    ItemsListBasicProps<Item>,
    'renderHeader' | 'renderItem' | 'propofHeader' | 'propofHeaderGroup' | 'propofItemGroup' | 'propofItem'
  >
>
/** just basic layout  */

export const TodoListItemTable = createKit(
  'TodoListItemsDisplayer',
  <Item extends Record<string, any>>({
    items,
    layoutType,
    getItemKey,
    onDeleteItem,
    onClickClearBtn,

    renderHeader,
    renderItem,
    ...props
  }: TodoListDisplayerProps<Item>) => {
    const gridICSS: ICSS = { display: 'grid', gap: 24, gridTemplateColumns: `1fr 2fr 48px` }
    return (
      <Div>
        {items.length > 0 ? (
          <ItemsListBasic
            {...props}
            items={items}
            getItemKey={getItemKey ?? (({ item, idx }) => item.id ?? idx)}
            renderHeader={
              renderHeader ??
              (({ firstItem }) =>
                firstItem && (
                  <Div icss={gridICSS}>
                    <For each={Object.keys(firstItem)} getKey={(_, idx) => idx}>
                      {(v) => <Div icss={{ marginBlock: 4, fontSize: 18, fontWeight: 'bold' }}>{stringify(v)}</Div>}
                    </For>
                    <Div plugin={click({ onClick: () => onClickClearBtn?.() })}> Clear </Div>
                  </Div>
                ))
            }
            renderItem={
              renderItem ??
              (({ item }) => (
                <Div icss={gridICSS}>
                  <For each={Object.values(item)} getKey={(_, idx) => idx}>
                    {(v) => <Div>{stringify(v)}</Div>}
                  </For>
                  <Icon
                    src='/delete.svg'
                    icss={{ color: 'crimson' }}
                    plugin={[
                      click({ onClick: () => onDeleteItem?.(item) }),
                      Kit((self) => (
                        <Tooltip placement='right' renderButton={self}>
                          delete
                        </Tooltip>
                      ))
                    ]}
                  />
                </Div>
              ))
            }
          />
        ) : null}
      </Div>
    )
  }
)
