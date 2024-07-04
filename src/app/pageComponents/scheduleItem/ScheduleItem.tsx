import { switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Group,
  Icon,
  List,
  Piv,
  Row,
  Text,
  createDisclosure,
  createIStore,
  cssColorMix,
  cssGrayscale,
  cssOpacity,
  icssCard,
  icssClickable,
  icssContentClickableOpacity,
  type CSSObject,
} from "@edsolater/pivkit"
import { createEffect, createMemo, on } from "solid-js"
import { reconcile } from "solid-js/store"
import { colors } from "../../theme/colors"
import { navigateToUrl } from "../../utils/url"
import { SelectPanel } from "./Select"
import { popupWidget } from "./popupWidget"
import {
  scheduleLinkItemCategories,
  type ScheduleItem,
  type ScheduleLinkItem,
  type ScheduleLinkItemCategories,
} from "./type"
import { json } from "@solidjs/router"

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

export function ScheduleItem(props: {
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
  const [innerItemData, setInnerItemData] = createIStore(props.item, {
    onChange: (innerItemData) => {
      props.onItemInfoChange?.(innerItemData)
    },
  })

  // reflect outer item change to inner item
  createEffect(
    on(
      () => props.item,
      () => {
        setInnerItemData(reconcile(props.item))
      },
      { defer: true },
    ),
  )

  const [inEditMode, { open: startEdit, close: endEdit, toggle: toggleEdit }] = createDisclosure(false, {
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

  createEffect(() => {
    console.log("inEditMode(): ", inEditMode())
  })

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
              "name      name      name" auto
              "tags      tags      tags    " 1fr
              "comment   comment   comment" auto / 1fr 1fr 1fr`,
          columnGap: "16px",
          rowGap: "8px",
        },
      ]}
    >
      {/* category */}
      <Text
        icss={[
          {
            gridArea: "category",
            color: colors.textPrimary,
            padding: "2px 8px",
            background: cssColorMix({ color: colors.card, percent: "60%" }, itemThemeColor()),
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
              defaultValue={props.item.category}
              onClose={closePopup}
              onChange={({ itemValue }) => {
                setInnerItemData("category", itemValue() as ScheduleLinkItem["category"])
              }}
            />
          ),
        })}
      >
        {props.item.category ?? " "}
      </Text>

      {/* name + links */}
      <Group icss={{ gridArea: "name" }}>
        <Box icss={{ display: "flex", gap: "8px" }} onClick={handleActionOpenLink}>
          <Text
            // plugin={popupWidget.config({
            //   popupDirection: "center",
            //   popElement: () => (
            //     <Input icss={{ fontSize: "1em", background: colors.appPanel }} defaultValue={() => props.item.name} />
            //   ),
            // })}
            icss={{ fontSize: "1.8em", "&:hover": { textDecoration: "underline solid", cursor: "pointer" } }}
          >
            {props.item.name}
          </Text>
          {/* action 1 */}
          <Button variant="plain" size={"xs"} icss={icssContentClickableOpacity}>
            <Icon name="open-window" src={"/icons/open_in_new.svg"} />
          </Button>
        </Box>
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
        items={props.item.tags?.split(" ")}
      >
        {(tag) => <Text icss={{ alignContent: "center" }}>{tag}</Text>}
      </List>

      {/* comment */}
      <Box icss={{ gridArea: "comment" }}>
        <Text>{props.item.comment}</Text>
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
