import { Box, Button, Icon, List, Piv, Row, Text, cssOpacity, icssCard, icssGrid } from "@edsolater/pivkit"
import type { LinkItem } from "./type"

export function LinkItemInfo(props: { item: LinkItem; onDelete?: () => void }) {
  function handleDelete() {
    props.onDelete?.()
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
      onClick={() => {
        openUrl(props.item.url, { blank: true })
      }}
    >
      {/* name + links */}
      <Text icss={{ fontSize: "2em", gridArea: "name" }}>{props.item.name}</Text>

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
        <Button variant="ghost" size={"sm"} onClick={handleDelete}>
          <Icon variant='btn' name="trash" src={"/icons/delete.svg"} icss={{ opacity: 0.7 }} />
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
