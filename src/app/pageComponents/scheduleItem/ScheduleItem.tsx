import { switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Icon,
  Input,
  List,
  Piv,
  Row,
  Text,
  cssColorMix,
  icssCard,
  icssClickable,
  icssContentClickableOpacity,
  type CSSColorString,
  type CSSObject,
  type ICSSObject,
} from "@edsolater/pivkit"
import { createMemo } from "solid-js"
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

// user configable
const scheduleItemColor = {
  externalLinks: {
    video: "dodgerblue", // only theme color
    resource: "green", // only theme color
    ai: "crimson", // only theme color
    article: "darkslateblue", // only theme color
  } satisfies Record<ScheduleLinkItemCategories, CSSObject['color']>,
  cardText: "#f5f5f5", // only theme color
}

function getScheduleItemColor(item: ScheduleItem) {
  return switchKey(item.is, { link: switchKey(item.category, scheduleItemColor.externalLinks) })
}

export function ScheduleItem(props: {
  item: ScheduleLinkItem
  onDelete?: () => void
  onEdit?: () => void
  onCategoryChange?: (category: ScheduleLinkItemCategories) => void
}) {
  function handleDelete() {
    props.onDelete?.()
  }

  function handleClickLink() {
    if (props.item.url) {
      navigateToUrl(props.item.url, { blank: true })
    }
  }

  function handleEdit() {
    props.onEdit?.()
  }

  const itemThemeColor = createMemo(() => getScheduleItemColor(props.item))
  return (
    <Box
      icss={[
        // icssCard({ bg: props.item.is === 'link' scheduleItemColor.cardLink }),
        icssCard({ bg: cssColorMix({ color: colors.card, percent: "90%" }, itemThemeColor()) }),
        {
          display: "grid",
          // TODO: use subgrid
          gridTemplate: `
              "category  category  category " auto
              "name      name      actions1" auto
              "tags      tags      tags    " auto
              "comment   comment   actions2" auto / auto auto auto`,
          columnGap: "16px",
          rowGap: "8px",
        },
      ]}
    >
      {/* category */}
      <Piv
        icss={[
          {
            gridArea: "category",
            color: colors.textPrimary,
            padding: "2px 8px",
            background: cssColorMix({ color: colors.card, percent: "60%" }, itemThemeColor()),
            width: "fit-content",
            borderRadius: "4px",
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
              onChange={({ itemValue, ...rest }) => {
                props.onCategoryChange?.(itemValue() as ScheduleLinkItemCategories)
              }}
            />
          ),
        })}
      >
        {props.item.category}
      </Piv>

      {/* name + links */}
      <Text
        //TODO: defaultValue not work
        plugin={popupWidget.config({
          popupDirection: "center",
          popElement: () => (
            <Input icss={{ fontSize: "1em", background: colors.appPanel }} defaultValue={() => props.item.name} />
          ),
        })}
        icss={{ fontSize: "1.8em", gridArea: "name" }}
      >
        {props.item.name}
      </Text>

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
        <Button variant="transparent" size={"xs"} onClick={handleEdit} icss={icssContentClickableOpacity}>
          <Icon name="edit" src={"/icons/edit.svg"} />
        </Button>

        <Button variant="transparent" size={"xs"} onClick={handleDelete} icss={icssContentClickableOpacity}>
          <Icon name="delete" src={"/icons/delete.svg"} />
        </Button>
      </Row>

      {/* action 1 */}
      <Row icss={{ gridArea: "actions1", justifySelf: "end" }}>
        <Button variant="transparent" size={"xs"} icss={icssContentClickableOpacity} onClick={handleClickLink}>
          <Icon name="open-window" src={"/icons/open_in_new.svg"} />
        </Button>
      </Row>
    </Box>
  )
}
