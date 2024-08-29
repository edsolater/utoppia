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
  Iframe,
  Piv,
  Row,
  SelectPanel,
  Text,
  TooltipPanel,
  withPopupWidget,
  type CSSObject,
  withEditable,
} from "@edsolater/pivkit"
import { createEffect, createMemo, on, Show } from "solid-js"
import { reconcile } from "solid-js/store"
import { colors } from "../../../app/theme/colors"
import { navigateToUrl } from "../../utils/url"
import { TagRow, TagWidget } from "./Tag"
import { scheduleLinkItemCategories, type ScheduleLinkItem, type ScheduleLinkItemCategories } from "./type"
import { updateExistedScheduleItem } from "./utils"

// user configable
// color:
const scheduleItemCSSColor = {
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

const getScheduleItemCSSColor = (item: ScheduleLinkItem) =>
  switchKey(item.category, scheduleItemCSSColor.externalLinks, scheduleItemCSSColor.defaultExternalLink)

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

  const [isIframePreviewOpen, { open: openIframePreview, close: closeIframePreview, toggle: toggleIframePreview }] =
    createDisclosure(false)

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

  function handleToggleIframePreview() {
    toggleIframePreview()
  }

  function handleActionEdit() {
    toggleEdit()
    props.onEdit?.()
  }

  const itemThemeCSSColor = createMemo(() => getScheduleItemCSSColor(props.item))

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
          bg: cssOpacity(
            cssColorMix({ color: cssGrayscale(itemThemeCSSColor(), 0.3), percent: "15%" }, colors.card),
            0.9,
          ),
        }),
        { backdropFilter: "blur(6px)" },
      ]}
    >
      <Box
        icss={[
          {
            display: "grid",
            // TODO: use subgrid
            gridTemplate: `
              "form  form  form" auto
              "form  form  form" 1fr
              "form  form  form" auto / 1fr 1fr 1fr`,
            columnGap: "16px",
            rowGap: "8px",
          },
        ]}
      >
        {/* content form */}
        <Group icss={{ gridArea: "form", display: "flex", gap: ".5em", flexDirection: "column" }}>
          <FormFactory formObj={innerScheduleItem}>
            <FormFactoryBlock visiable name="category">
              {(scheduleItemCategory) => (
                <TagWidget
                  $debug
                  bg={cssColorMix({ color: colors.card, percent: "60%" }, itemThemeCSSColor())}
                  candidates={scheduleLinkItemCategories}
                  key="scheduleItemCategory"
                  value={scheduleItemCategory}
                  defaultValue={scheduleItemCategory}
                  onChange={(tag) => {
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
                  key={`scheduleItemTags:${innerScheduleItem.category}`}
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

          <Piv
            icss={{ width: "10rem", height: "10rem", background: "#fff2", display: "grid", placeContent: "center" }}
            htmlProps={{ contentEditable: "inherit" }}
            // plugin={withEditable.config({})}
          >
            {/* <Icon icss={{ opacity: 0.6 }} src={"/icons/add_box.svg"} /> */}
          </Piv>
        </Group>

        {/* topActions */}
        <Row icss={[{ gridArea: "1 / -2 ", justifySelf: "end" }]}>
          <Button
            variant="plain"
            plugin={withPopupWidget.config({
              // TODO: should show with hover
              shouldFocusChildWhenOpen: true,
              popupDirection: "bottom",
              elementHtmlTitle: "show iframe",
              triggerBy: "hover",
              popElement: () => (
                <TooltipPanel>
                  <Text>show iframe</Text>
                </TooltipPanel>
              ),
            })}
            size={"xs"}
            icss={icssContentClickableOpacity}
            onClick={handleToggleIframePreview}
          >
            <Icon name="show-iframe" src={"/icons/preview.svg"} />
          </Button>
          <Button
            variant="plain"
            plugin={withPopupWidget.config({
              // TODO: should show with hover
              shouldFocusChildWhenOpen: true,
              popupDirection: "bottom",
              elementHtmlTitle: "open in new tab",
              triggerBy: "hover",
              popElement: () => (
                <TooltipPanel>
                  <Text>open in new tab</Text>
                </TooltipPanel>
              ),
            })}
            size={"xs"}
            icss={icssContentClickableOpacity}
            onClick={handleActionOpenLink}
          >
            <Icon name="open-tab" src={"/icons/open_in_new.svg"} />
          </Button>
          {/* edit-button */}
          <Button
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

        {/* buttonActions */}
        <Group icss={{ gridArea: " -2 / -2 ", justifySelf: "end" }}>
          {/* name="action button: add_form_block " */}
          <Button
            variant="plain"
            size={"xs"}
            icss={icssContentClickableOpacity}
            plugin={withPopupWidget.config({
              shouldFocusChildWhenOpen: true,
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
      </Box>

      <Show when={isIframePreviewOpen()}>
        <Iframe src={props.item.url} icss={{ width: "100%", aspectRatio: "16 / 9" }} />
      </Show>
    </Box>
  )
}
