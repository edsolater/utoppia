import { switchKey } from "@edsolater/fnkit"
import {
  Box,
  Button,
  Icon,
  Input,
  List,
  Piv,
  Row,
  Select,
  Text,
  cssColorMix,
  cssOpacity,
  icssCard,
  icssContentClickableOpacity,
  icssRow,
} from "@edsolater/pivkit"
import { createSignal } from "solid-js"
import { colors } from "../../theme/colors"
import { navigateToUrl } from "../../utils/url"
import { popupWidget } from "./popupWidget"
import type { ScheduleItem, ScheduleLinkItem, ScheduleLinkItemCategories } from "./type"

// user configable
const scheduleItemColor = {
  externalLinks: {
    video: cssColorMix(colors.cardBg, "dodgerblue"), // only theme color
    resource: cssColorMix(colors.cardBg, "green"), // only theme color
  } satisfies Record<ScheduleLinkItemCategories, string>,
  cardText: "#f5f5f5", // only theme color
}

function getScheduleItemColor(item: ScheduleItem) {
  return switchKey(item.is, { link: switchKey(item.category, scheduleItemColor.externalLinks) })
}

export function ScheduleItem(props: { item: ScheduleLinkItem; onDelete?: () => void; onEdit?: () => void }) {
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

  const [itemThemeColor, setItemThemeColor] = createSignal(getScheduleItemColor(props.item))
  return (
    <Box
      icss={[
        // icssCard({ bg: props.item.is === 'link' scheduleItemColor.cardLink }),
        icssCard({ bg: itemThemeColor() }),
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
        icss={{
          gridArea: "category",
          color: scheduleItemColor.cardText,
          padding: "2px 8px",
          background: "dodgerblue",
          width: "fit-content",
          borderRadius: "4px",
        }}
        plugin={popupWidget.config({
          popElement: () => <Select name="color-selector" items={["dodgerblue", "orange"] as const}></Select>,
        })}
      >
        {props.item.category}
      </Piv>

      {/* name + links */}
      <Text
        //TODO: defaultValue not work
        plugin={popupWidget.config({
          popElement: () => <Input icss={{ fontSize: "1em" }} defaultValue={() => props.item.name} />,
        })}
        icss={{ fontSize: "1.8em", gridArea: "name" }}
      >
        {props.item.name}
      </Text>

      {/* tag */}
      <List
        icss={{
          gridArea: "tags",
          color: cssOpacity("currentcolor", 0.6),
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

      <Row icss={[{ gridArea: "actions2", justifySelf: "end" }]}>
        <Button variant="transparent" size={"xs"} onClick={handleEdit} icss={icssContentClickableOpacity}>
          <Icon name="edit" src={"/icons/edit.svg"} />
        </Button>

        <Button variant="transparent" size={"xs"} onClick={handleDelete} icss={icssContentClickableOpacity}>
          <Icon name="delete" src={"/icons/delete.svg"} />
        </Button>
      </Row>

      <Row icss={{ gridArea: "actions1", justifySelf: "end" }}>
        <Button variant="transparent" size={"xs"} icss={icssContentClickableOpacity} onClick={handleClickLink}>
          <Icon name="open-window" src={"/icons/open_in_new.svg"} />
        </Button>
      </Row>
    </Box>
  )
}


