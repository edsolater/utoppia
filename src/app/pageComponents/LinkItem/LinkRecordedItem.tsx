import { Box, Button, Icon, List, Piv, Row, Text, cssOpacity, icssCard, icssGrid } from "@edsolater/pivkit"
import type { LinkItem } from "./type"

export function LinkItemInfo(props: { item: LinkItem; onDelete?: () => void; onEdit?: () => void }) {
  function handleDelete() {
    props.onDelete?.()
  }

  function handleClickLink() {
    openUrl(props.item.url, { blank: true })
  }

  function handleEdit() {
    props.onEdit?.()
  }

  return (
    <Box
      icss={[
        icssCard,
        {
          display: "grid",
          gridTemplate: `
              "name    tags    actions" auto
              "comment comment comment" 1fr / auto 1fr auto`,
          columnGap: "16px",
          rowGap: "8px",
        },
      ]}
    >
      {/* name + links */}
      <Text icss={{ fontSize: "1.8em", gridArea: "name" }}>{props.item.name}</Text>

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
      <Box if={props.item.comment} icss={{ gridArea: "comment" }}>
        <Text>{props.item.comment}</Text>
      </Box>

      <Row icss={{ gridArea: "actions" }}>
        <Button variant="ghost" size={"xs"} onClick={handleDelete}>
          <Icon name="delete" src={"/icons/delete.svg"} />
        </Button>
        <Button variant="ghost" size={"xs"} onClick={handleClickLink}>
          <Icon name="open-window" src={"/icons/link.svg"} />
        </Button>
        <Button variant="ghost" size={"xs"} onClick={handleEdit}>
          <Icon name="edit" src={"/icons/edit.svg"} />
        </Button>
      </Row>
    </Box>
  )
}
function openUrl(url: string, options?: { /* new page */ blank?: boolean }) {
  window.open(url, options?.blank ? "_blank" : "_self")
}

export function SiteItem(props: { item: LinkItem; level?: number }) {
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
