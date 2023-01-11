import { isObject } from '@edsolater/fnkit'
import { AddProps, createKit, Div, DivChildNode, DivProps, For, Group, ICSSObject } from '@edsolater/uikit'

export type ListTableProps<T extends Record<string, any> = Record<string, any>> = {
  items: T[]
  getItemKey?: (info: { item: T; idx: number }) => string | number

  // -------- sub --------
  renderItem?: (info: { item: T }) => DivChildNode
  renderHeader?: (info: { items: T[]; firstItem?: T }) => DivChildNode
  anatomy?: {
    item?: DivProps
    header?: DivProps
    itemGroup?: DivProps
    headerGroup?: DivProps
  }
}

export const ListTable = createKit(
  'ListTable',
  <T extends Record<string, any>>({ items, getItemKey, anatomy }: ListTableProps<T>) => {
    const itemPropertyNames = getItemsProperties(items)
    console.log('itemPropertyNames: ', itemPropertyNames)
    const gridICSS: ICSSObject = { display: 'grid', gap: 24, gridTemplateColumns: `1fr 2fr 48px` }
    return (
      <Div icss={{ border: '1px solid', padding: 4 }}>
        <Group shadowProps={anatomy?.headerGroup} name='list-header'>
          <Div shadowProps={anatomy?.header}>
            <For each={itemPropertyNames}>
              {(n) => <Div icss={{ marginBlock: 4, fontSize: 18, fontWeight: 'bold' }}>{n}</Div>}
            </For>
          </Div>
        </Group>

        <Group shadowProps={anatomy?.itemGroup} name='list-item-group' icss={{ display: 'grid', gap: 8 }}>
          <For each={items} getKey={(item, idx) => getItemKey?.({ item, idx })}>
            {(item) => (
              <AddProps shadowProps={anatomy?.item}>
                <Div icss={gridICSS}>
                  <For each={Object.values(item)} getKey={(_, idx) => idx}>
                    {(itemValue) => <Div>{isObject(itemValue) ? '[todo]' : itemValue}</Div>}
                  </For>
                </Div>
              </AddProps>
            )}
          </For>
        </Group>
      </Div>
    )
  }
)
function getItemsProperties(items: Record<string, any>[]) {
  return [...new Set(items.flatMap((i) => Object.keys(i)))]
}
