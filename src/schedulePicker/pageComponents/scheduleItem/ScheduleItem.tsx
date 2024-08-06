import { switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  createDisclosure,
  createIStore,
  cssColorMix,
  cssGrayscale,
  cssOpacity,
  FormFactory,
  FormFactoryBlock,
  Group,
  Icon,
  icssCard,
  icssContentClickableOpacity,
  List,
  Row,
  Text,
  type CSSObject,
} from "@edsolater/pivkit"
import { createEffect, createMemo, on } from "solid-js"
import { reconcile } from "solid-js/store"
import { colors } from "../../../app/theme/colors"
import { navigateToUrl } from "../../utils/url"
import { SelectPanel } from "./Select"
import { Tag } from "./Tag"
import { editablePlugin, type EditablePluginPluginController } from "./editablePlugin"
import { popupWidget } from "./popupWidget"
import {
  scheduleLinkItemCategories,
  type ScheduleItem,
  type ScheduleLinkItem,
  type ScheduleLinkItemCategories,
} from "./type"
import { updateExistedScheduleItem } from "./utils"

// user configable
// color:
const scheduleItemColor = {
  externalLinks: {
    video: "red", // only theme color
    resource: "green", // only theme color
    ai: "blue", // only theme color
    article: "purple", // only theme color
    up主: "orange", // only theme color
  } satisfies Record<ScheduleLinkItemCategories, CSSObject["color"]>,
  defaultExternalLink: "#ffffffdd",
  cardText: "#f5f5f5", // only theme color
}

function getScheduleItemColor(item: ScheduleItem) {
  return (
    switchKey(item.is, { link: switchKey(item.category, scheduleItemColor.externalLinks) }) ??
    scheduleItemColor.defaultExternalLink
  )
}

/**
 * main component of page
 */
export function ScheduleItemCard(props: {
  item: ScheduleLinkItem

  /** user  attempt to delete this item */
  onDelete?: () => void

  /** detect inner edit mode is started */
  onEdit?: () => void

  /**
   * detect inner item info change
   * when end edit mode or user change item info
   */
  onItemInfoChange?: (newItem: ScheduleLinkItem) => void
}) {
  const [innerItemData, setInnerCacheItemData] = createIStore(
    { ...props.item },
    {
      onChange(newStore) {
        updateExistedScheduleItem(newStore.id, newStore)
      },
    },
  )

  // reflect outer item change to inner item
  createEffect(
    on(
      () => props.item,
      () => {
        setInnerCacheItemData(reconcile({ ...props.item }))
      },
      { defer: true },
    ),
  )

  const [inEditMode, { open: startEdit, close: endEdit, toggle: toggleEdit }] = createDisclosure(false, {
    onClose() {
      props.onItemInfoChange?.(innerItemData)
    },
  })

  // should only reflect to item's name
  const [
    isTextNameInEditMode,
    { open: startTextNameEdit, close: endTextNameEdit, toggle: toggleTextNameEditMode, set: setTextNameEditState },
  ] = createDisclosure(false, {
    onClose() {
      props.onItemInfoChange?.(innerItemData)
    },
  })

  function handleActionDelete() {
    props.onDelete?.()
  }

  function handleActionOpenLink() {
    if (props.item.url) {
      navigateToUrl(props.item.url, { blank: true })
    }
  }

  function handleActionEdit() {
    toggleEdit()
    props.onEdit?.()
  }

  const itemThemeColor = createMemo(() => getScheduleItemColor(props.item))

  return (
    <Box
      icss={[
        // icssCard({ bg: props.item.is === 'link' scheduleItemColor.cardLink }),
        icssCard({
          bg: cssOpacity(cssColorMix({ color: cssGrayscale(itemThemeColor(), 0.3), percent: "30%" }, colors.card), 0.9),
        }),
        {
          display: "grid",
          // TODO: use subgrid
          gridTemplate: `
              "form  form  actions2" auto
              "form  form  actions1" auto
              "form  form  .       " 1fr
              "form  form  actions3" auto / 1fr 1fr 1fr`,
          columnGap: "16px",
          rowGap: "8px",
        },
      ]}
    >
      {/* name + links */}
      <Group icss={{ gridArea: "form", display: "flex", gap: ".125em", flexDirection: "column" }}>
        <FormFactory formObj={innerItemData}>
          <FormFactoryBlock name="category">
            {(currentCategoryValue) => (
              <Tag
                bg={cssColorMix({ color: colors.card, percent: "60%" }, itemThemeColor())}
                candidates={scheduleLinkItemCategories}
                value={currentCategoryValue}
                defaultValue={currentCategoryValue}
                onChange={({ itemValue }) => {
                  const newCategory = itemValue() as ScheduleLinkItem["category"]
                  setInnerCacheItemData("category", newCategory)
                }}
              >
                {currentCategoryValue}
              </Tag>
            )}
          </FormFactoryBlock>

          <FormFactoryBlock name="name">
            {(currentNameValue) => (
              <Text
                icss={({ isEnabled }: EditablePluginPluginController) => ({
                  display: "inline-block",
                  width: "100%",
                  fontSize: "1.6em",
                  outline: isEnabled() ? "solid" : undefined,
                })}
                plugin={editablePlugin.config({
                  placeholder: "Title",
                  onInput: (newText) => setInnerCacheItemData({ name: newText }),
                  onEnabledChange: (b) => {
                    if (!b) {
                      props.onItemInfoChange?.(innerItemData)
                    }
                  },
                })}
              >
                {currentNameValue}
              </Text>
            )}
          </FormFactoryBlock>

          <FormFactoryBlock name="tags" when={(v) => v}>
            {(tagString) => (
              <List
                icss={{
                  gridArea: "tags",
                  color: colors.textSecondary,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                }}
                items={tagString?.split(" ")}
              >
                {(tag) => <Text icss={{ alignContent: "center" }}>{tag as any}</Text>}
              </List>
            )}
          </FormFactoryBlock>

          <FormFactoryBlock name="comment" when={(v) => v}>
            {(value) => <Text>{value}</Text>}
          </FormFactoryBlock>
        </FormFactory>
      </Group>

      {/* action 1 */}
      <Group icss={{ gridArea: "actions1", justifySelf: "end" }}>
        <Button variant="plain" size={"xs"} icss={icssContentClickableOpacity} onClick={handleActionOpenLink}>
          <Icon name="open-window" src={"/icons/open_in_new.svg"} />
        </Button>
      </Group>

      {/* action 3 */}
      <Group icss={{ gridArea: "actions3", placeSelf: "end" }}>
        <Button
          variant="plain"
          size={"xs"}
          icss={icssContentClickableOpacity}
          plugin={popupWidget.config({
            shouldFocusChildWhenOpen: true,
            canBackdropClose: true,
            popElement: ({ closePopup }) => (
              <SelectPanel
                name="edit-new-widget-selector"
                candidates={["tags", "comment", "title"]}
                onClose={closePopup}
              />
            ),
          })}
        >
          <Icon name="open-window" src={"/icons/add_box.svg"} />
        </Button>
      </Group>

      {/* action2 */}
      <Row icss={[{ gridArea: "actions2", justifySelf: "end" }]}>
        <Button
          class={"edit-btn"}
          variant="plain"
          isActive={inEditMode}
          size={"xs"}
          onClick={handleActionEdit}
          icss={icssContentClickableOpacity}
        >
          {({ isActive }) => <Icon name="edit" src={isActive() ? "/icons/edit_fill.svg" : "/icons/edit.svg"} />}
        </Button>

        <Button variant="plain" size={"xs"} onClick={handleActionDelete} icss={icssContentClickableOpacity}>
          <Icon name="delete" src={"/icons/delete.svg"} />
        </Button>
      </Row>
    </Box>
  )
}
