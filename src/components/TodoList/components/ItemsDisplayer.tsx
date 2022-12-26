import { AddProps, createKit, Div, DivChildNode, DivProps, For, Group } from '@edsolater/uikit'

export type ItemsListBasicProps<T extends Record<string, any> = Record<string, any>> = {
  items: T[]
  getItemKey: (info: { item: T; idx: number }) => string | number

  renderItem: (info: { item: T }) => DivChildNode
  renderHeader: (info: { items: T[]; firstItem?: T }) => DivChildNode
  /** only when renderItem is not set */
  propofItem?: DivProps
  /** only when renderHeader is not set */
  propofHeader?: DivProps
  /** only when renderItemGroup* is not set */
  propofItemGroup?: DivProps
  /** only when renderHeaderGroup is not set */
  propofHeaderGroup?: DivProps
}

/** basic  */
export const ItemsListBasic = createKit(
  'ItemsListBasic',
    <T extends Record<string, any>>({
      items,
      getItemKey,

      renderItem,
      renderHeader,
      propofHeader,
      propofHeaderGroup,
      propofItem,
      propofItemGroup
    }: ItemsListBasicProps<T>) =>
      (
        <Div icss={{ border: '1px solid', padding: 4 }}>
          <Group shadowProps={propofHeaderGroup} name='list-header'>
            <AddProps shadowProps={propofHeader}>{renderHeader({ items: items, firstItem: items.at(0) })}</AddProps>
          </Group>

          <Group shadowProps={propofItemGroup} name='list-item-group' icss={{ display: 'grid', gap: 8 }}>
            <For each={items} getKey={(item, idx) => getItemKey({ item, idx })}>
              {(item) => (
                <AddProps
                  // propHook={[(props) => {
                  //   useConsoleLog({ data: { props } })
                  // }]}
                  shadowProps={propofItem}
                >
                  {renderItem({ item })}
                </AddProps>
              )}
            </For>
          </Group>
        </Div>
      )
)
