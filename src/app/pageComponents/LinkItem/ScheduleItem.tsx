import {
  Box,
  Button,
  Icon,
  Input,
  List,
  Loop,
  Piv,
  Row,
  Text,
  cssOpacity,
  icssCard,
  icssContentClickableOpacity,
  icssGrid,
} from "@edsolater/pivkit"
import { navigateToUrl } from "../../utils/url"
import { popupWidget } from "./popupWidget"
import type { ScheduleLinkItem } from "./type"
import { colors } from "../../theme/colors"

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

  return (
    <Box
      icss={[
        icssCard({ bg: colors.cardBg }),
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
        items={props.item.tag?.split(" ")}
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

export function SiteItem(props: { item: ScheduleLinkItem; level?: number }) {
  // const {gridContainerICSS, gridItemICSS} = useICSS('Grid')
  return (
    <Piv
      icss={[
        icssCard,
        icssGrid({
          template: `
            "info" auto 
            "sub " auto / 1fr
          `,
          gap: "1em",
        }),
        { color: "#1b1b1d" },
      ]}
    >
      {/* <Box icss={icssGridItem({ area: "info" })}>
        <Box icss={icssRow({ gap: "8px" })}>
          <Link href={props.item.url}>
            <Box icss={icssRow({ gap: "8px" })}>
              
              <Text icss={{ fontSize: "2em", fontWeight: "bold" }}>{props.item.name}</Text>
            </Box>
          </Link>
          <Loop of={props.item.keywords} icss={icssRow({ gap: ".5em" })}>
            {(keyword) => <Text icss={{ fontSize: "1em" }}>{keyword}</Text>}
          </Loop>
          <Button onClick={() => props.item.url && parseUrl(props.item.url)}>fetch</Button>
        </Box>
      </Box> */}
    </Piv>
  )
}
