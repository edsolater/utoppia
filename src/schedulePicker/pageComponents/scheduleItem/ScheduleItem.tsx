import { switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  createDisclosure,
  createIStore,
  cssColorMix,
  cssGrayscale,
  cssOpacity,
  Detector,
  Group,
  Icon,
  icssCard,
  icssClickable,
  icssContentClickableOpacity,
  List,
  Row,
  Text,
  useKitProps,
  type CSSObject,
  type KitProps,
} from "@edsolater/pivkit"
import { createEffect, createMemo, on, type Accessor } from "solid-js"
import { reconcile } from "solid-js/store"
import { colors } from "../../../app/theme/colors"
import { navigateToUrl } from "../../utils/url"
import { SelectPanel, type SelectPanelProps } from "./Select"
import { editablePlugin, EditablePluginWrapper, type EditablePluginPluginController } from "./editablePlugin"
import { popupWidget } from "./popupWidget"
import {
  scheduleLinkItemCategories,
  type ScheduleItem,
  type ScheduleLinkItem,
  type ScheduleLinkItemCategories,
} from "./type"
import { visiblePlugin } from "./visiablePlugin"
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
              "category  category  actions2 " auto
              "name      name      actions1" auto
              "tags      tags      tags    " 1fr
              "comment   comment   comment" auto / 1fr 1fr 1fr`,
          columnGap: "16px",
          rowGap: "8px",
        },
      ]}
    >
      {/* category */}
      <Tag
        bg={cssColorMix({ color: colors.card, percent: "60%" }, itemThemeColor())}
        scheduleLinkItemCategories={scheduleLinkItemCategories}
        value={innerItemData.category}
        defaultValue={innerItemData.category}
        onChange={({ itemValue }) => {
          const newCategory = itemValue() as ScheduleLinkItem["category"]
          console.log("newCategory: ", newCategory)
          setInnerCacheItemData("category", newCategory)
        }}
      >
        {props.item.category}
      </Tag>

      {/* name + links */}
      <Group icss={{ gridArea: "name" }}>
        {/* TODO: may be this mode is strightforward but too complex to type */}
        <Detector>
          {({ isHovered }) => (
            <Box icss={{ display: "flex", gap: "8px" }}>
              <Text
                icss={({ isEnabled }: EditablePluginPluginController) => ({
                  flexGrow: 1,
                  fontSize: "1.8em",
                  outline: isEnabled() ? "solid" : undefined,
                })}
                plugin={editablePlugin.config({
                  onInput: (newText) => setInnerCacheItemData({ name: newText }),
                  onEnabledChange: (b) => {
                    if (!b) {
                      props.onItemInfoChange?.(innerItemData)
                    }
                  },
                })}
              >
                {props.item.name}
              </Text>
            </Box>
          )}
        </Detector>
      </Group>

      {/* action 1 */}
      <Group icss={{ gridArea: "actions1", justifySelf: "end" }}>
        <Button variant="plain" size={"xs"} icss={icssContentClickableOpacity} onClick={handleActionOpenLink}>
          <Icon name="open-window" src={"/icons/open_in_new.svg"} />
        </Button>
      </Group>

      {/* tags */}
      <List
        icss={{
          gridArea: "tags",
          color: colors.textSecondary,
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
        }}
        items={innerItemData.tags?.split(" ")}
      >
        {(tag) => <Text icss={{ alignContent: "center" }}>{tag}</Text>}
      </List>

      {/* comment */}
      <Box icss={{ gridArea: "comment" }}>
        <Text>{innerItemData.comment}</Text>
      </Box>

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

/**
 * TODO: should normalized and move to pivkit
 */
function Tag(
  kitProps: KitProps<{
    bg: string
    scheduleLinkItemCategories: ScheduleLinkItemCategories[]
    defaultValue: ScheduleLinkItem["category"]
    value: ScheduleLinkItem["category"]
    onChange: SelectPanelProps<ScheduleLinkItem["category"]>["onChange"]
  }>,
) {
  const { props } = useKitProps(kitProps, { name: "Tag" })
  return (
    <Text
      icss={[
        {
          gridArea: "category",
          color: colors.textPrimary,
          padding: "2px 8px",
          background: props.bg,
          width: "fit-content",
          minWidth: "3em",
          borderRadius: "4px",
          textAlign: "center",
        },
        icssClickable,
      ]}
      plugin={popupWidget.config({
        shouldFocusChildWhenOpen: true,
        canBackdropClose: true,
        popElement: ({ closePopup }) => (
          <SelectPanel
            name="category-selector"
            items={scheduleLinkItemCategories}
            defaultValue={props.defaultValue}
            onClose={closePopup}
            onChange={props.onChange}
          />
        ),
      })}
    >
      {props.value ?? " "}
    </Text>
  )
}
