import { setTimeoutWithSecondes, switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  createDisclosure,
  createIStore,
  cssColorMix,
  cssGrayscale,
  cssOpacity,
  EditableText,
  FormFactory,
  FormFactoryBlock,
  Group,
  Icon,
  icssCard,
  icssContentClickableOpacity,
  Row,
  type CSSObject,
} from "@edsolater/pivkit"
import { createEffect, createMemo, on } from "solid-js"
import { reconcile } from "solid-js/store"
import { colors } from "../../../app/theme/colors"
import { navigateToUrl } from "../../utils/url"
import { SelectPanel } from "./Select"
import { TagRow, TagWidget } from "./Tag"
import { popupWidget } from "./popupWidget"
import { scheduleLinkItemCategories, type ScheduleLinkItem, type ScheduleLinkItemCategories } from "./type"
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

function getScheduleItemColor(item: ScheduleLinkItem) {
  return switchKey(item.category, scheduleItemColor.externalLinks)
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
  const [innerScheduleItem, setInnerCacheItemData] = createIStore(
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
      props.onItemInfoChange?.(innerScheduleItem)
    },
  })

  // should only reflect to item's name
  const [
    isTextNameInEditMode,
    { open: startTextNameEdit, close: endTextNameEdit, toggle: toggleTextNameEditMode, set: setTextNameEditState },
  ] = createDisclosure(false, {
    onClose() {
      props.onItemInfoChange?.(innerScheduleItem)
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

  function updateTempItemData(propertyName: keyof ScheduleLinkItem, newValue: any) {
    setInnerCacheItemData(propertyName, newValue)
  }
  // innerMethod: end the input
  function commitTempItemDataToReal() {
    props.onItemInfoChange?.(innerScheduleItem)
  }
  return (
    <Box
      icss={[
        // icssCard({ bg: props.item.is === 'link' scheduleItemColor.cardLink }),
        icssCard({
          bg: cssOpacity(cssColorMix({ color: cssGrayscale(itemThemeColor(), 0.3), percent: "15%" }, colors.card), 0.9),
        }),
        {
          display: "grid",
          // TODO: use subgrid
          gridTemplate: `
              "form  form  actions2" auto
              "form  form  actions1" auto
              "form  form  .       " 1fr
              "form  form  actions3" auto / 1fr 1fr auto`,
          columnGap: "16px",
          rowGap: "8px",
          backdropFilter: "blur(6px)",
        },
      ]}
    >
      {/* content form */}
      <Group icss={{ gridArea: "form", display: "flex", gap: ".5em", flexDirection: "column" }}>
        <FormFactory formObj={innerScheduleItem}>
          <FormFactoryBlock name="category">
            {(scheduleItemCategory) => (
              <TagWidget
                bg={cssColorMix({ color: colors.card, percent: "60%" }, itemThemeColor())}
                candidates={scheduleLinkItemCategories}
                candidateKey={"scheduleItemCategory"}
                value={scheduleItemCategory}
                defaultValue={scheduleItemCategory}
                onChange={(tag) => {
                  console.log("tag: ", tag)
                  updateTempItemData("category", tag)
                }}
              >
                {scheduleItemCategory}
              </TagWidget>
            )}
          </FormFactoryBlock>
          <FormFactoryBlock name="name">
            {(scheduleItemName) => (
              <EditableText
                icss={({ isEnabled }) => ({
                  display: "inline-block",
                  width: "100%",
                  fontSize: "1.6em",
                  outline: isEnabled() ? "solid" : undefined,
                })}
                placeholder="Title"
                onInput={(t) => updateTempItemData("name", t)}
                onEnabledChange={(b) => {
                  if (!b) {
                    commitTempItemDataToReal()
                  }
                }}
                defaultValue={scheduleItemName}
              />
            )}
          </FormFactoryBlock>
          <FormFactoryBlock name="url">
            {(scheduleItemUrl) => (
              <EditableText
                icss={({ isEnabled }) => ({
                  display: "inline-block",
                  width: "100%",
                  fontSize: ".8em",
                  color: colors.textSecondary,
                  outline: isEnabled?.() ? "solid" : undefined,
                })}
                defaultValue={scheduleItemUrl}
                placeholder="https://example.com"
                onInput={(t) => updateTempItemData("url", t)}
                onEnabledChange={(b) => {
                  if (!b) {
                    commitTempItemDataToReal()
                  }
                }}
              />
            )}
          </FormFactoryBlock>
          <FormFactoryBlock name="tags">
            {(scheduleItemTags) => (
              <TagRow
                candidateKey={`scheduleItemTags:${innerScheduleItem.category}`}
                value={scheduleItemTags}
                defaultValue={[" "]}
                icss={{ color: colors.textSecondary }}
                onChange={(tags) => {
                  updateTempItemData("tags", tags)
                }}
              />
            )}
          </FormFactoryBlock>
          <FormFactoryBlock name="comment">
            {(scheduleItemComment) => (
              <EditableText
                icss={{ color: colors.textSecondary }}
                defaultValue={scheduleItemComment}
                placeholder={"empty comments"}
                onInput={(t) => updateTempItemData("comment", t)}
                onEnabledChange={(b) => {
                  if (!b) {
                    commitTempItemDataToReal()
                  }
                }}
              />
            )}
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
        {/* name="action button: add_form_block " */}
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
                candidates={[{ value: "tags", disabled: true }, "comment", "title"]}
                onClose={closePopup}
                onSelect={({ itemValue }) => {
                  setTimeoutWithSecondes(() => {
                    closePopup()
                  }, 0.2)
                }}
              />
            ),
          })}
        >
          <Icon src={"/icons/add_box.svg"} />
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
