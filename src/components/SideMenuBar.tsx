import { groupBy, pickProperty } from '@edsolater/fnkit'
import {
  Accordion,
  AccordionButton,
  AccordionPanel,
  createKit,
  Div,
  For,
  Icon,
  letOpenAutoHandled,
  Row,
  Text
} from '@edsolater/uikit'
import { SideMenuEntryItem } from '../configs/sideMenu'
import { useTheme } from '../theme/ThemeProvider'

export const SideMenuBar = createKit(
  'SideMenuBar',
  ({
    activeEntryItem,
    entryItems,
    onChangeItem
  }: {
    activeEntryItem: SideMenuEntryItem
    entryItems: SideMenuEntryItem[]
    onChangeItem?: (entry: SideMenuEntryItem) => void
  }) => {
    const theme = useTheme()
    const tree = parseToTreeStructure(entryItems)
    return (
      <Div icss={{ background: theme.colors.sideBarBg }}>
        <For each={tree} getKey={pickProperty('groupName')}>
          {({ groupName, entries }) => (
            <Accordion plugin={letOpenAutoHandled({ defaultOpen: true })}>
              <AccordionButton>
                <Div>{groupName}</Div>
              </AccordionButton>
              <AccordionPanel>
                {/*TODO: `<dialog>` */}
                <For each={entries} getKey={pickProperty('name')}>
                  {(entry) => (
                    <Row
                      onClick={() => {
                        onChangeItem?.(entry)
                      }}
                    >
                      <Icon
                        src={entry.entryIcon}
                        cssColor={activeEntryItem?.name === entry.name ? 'cornflowerblue' : 'dodgerblue'}
                      />
                      <Text>{entry.name}</Text>
                    </Row>
                  )}
                </For>
              </AccordionPanel>
            </Accordion>
          )}
        </For>
      </Div>
    )
  }
)

function parseToTreeStructure(entries: SideMenuEntryItem[]): { groupName: string; entries: SideMenuEntryItem[] }[] {
  const grouped = groupBy(entries, (e) => e.group)
  return Object.entries(grouped).map(([groupName, entries]) => ({ groupName, entries }))
}
