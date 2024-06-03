import { Box, Button, List, Piv, Row, Text, icssCard, icssGrid } from "@edsolater/pivkit"
import { Link } from "../../components/Link"
import type { LinkItem } from "./type"
import { Show } from "solid-js"

export function LinkRecordedItem(props: { item: LinkItem; onDelete?: () => void }) {
  function handleDelete() {
    props.onDelete?.()
  }
  console.log("props.item: ", props.item)

  return (
    <Row icss={{ marginBlock: "8px" }}>
      {/* name + links */}
      <Link href={props.item.url}>{props.item.name}</Link>

      {/* tag */}
      <Box>
        <List items={props.item.tag?.split("")}>{(tag) => <Text>{tag}</Text>}</List>
      </Box>

      {/* comment */}
      <Box if={props.item.comment}>
        <Text>{props.item.comment}</Text>
      </Box>

      <Button size={"sm"} onClick={handleDelete}>
        🔥
      </Button>
    </Row>
  )
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
