import {
  Box,
  cssOpacity,
  Icon,
  icssCard,
  Image,
  List,
  Section,
  Text,
  useKitProps,
  type KitProps,
} from "@edsolater/pivkit"
import { createEffect, createResource } from "solid-js"
import { Link } from "../app/components/Link"
import { colors } from "../app/theme/colors"
import { serverOrigin } from "./configs/env"
import type { BriefVedioInfo } from "./data/briefVedioInfo"
import { bilibiliStore } from "./fetchData"

/**
 * Renders the VideoCollectorPage component.
 * This component fetches and displays a list of videos from the bilibiliStore.
 */
export default function VideoCollectorPage() {
  const [videoList, videoListManager] = createResource(() => bilibiliStore.ups.getVideos())

  createEffect(() => {
    console.log("videoList: ", videoList())
  })

  return (
    <List
      items={videoList()}
      icss={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
        gap: "16px",
      }}
    >
      {(briefVideo) => <BriefVideoInfoCard info={briefVideo} />}
    </List>
  )
}

/**
 * Renders a card displaying brief information about a video.
 * @param props - The props containing the video information.
 */
function BriefVideoInfoCard(props: { info: BriefVedioInfo }) {
  const thumbnailSrc = `${serverOrigin}/bilibili/img-proxy?url=${props.info.thumbnail}@672w_378h_1c_!web-home-common-cover.avif`
  const authorFaceSrc = `${serverOrigin}/bilibili/img-proxy?url=${props.info.authorFace}@96w_96h_1c_1s_!web-avatar.avif`
  return (
    <Card
      name="brief-video-info-card"
      icss={[
        icssCard({
          bg: cssOpacity(colors.card, 0.8),
        }),
        {
          display: "grid",
          gridTemplate: `
          "title  thumbnail" auto
          "detail thumbnail" auto / 3fr 1fr`,
        },
      ]}
    >
      <Section icss={{ gridArea: "title" }}>
        <Link icss={{ color: colors.textLink }} href={`https://www.bilibili.com/video/${props.info.bvid}`}>
          {props.info.title}
        </Link>
        <Text icss={{ display: "inline-block", fontSize: "1em" }}>
          {new Date(props.info.pubdate * 1000).toLocaleDateString()}
        </Text>
      </Section>

      <Section icss={{ gridArea: "thumbnail", alignSelf: "end", justifySelf: "end" }}>
        <Box icss={{ position: "relative" }}>
          <Image
            src={thumbnailSrc}
            icss={{ width: "100px", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: "4px" }}
          />
          <Text
            icss={{ fontSize: ".8em", fontWeight: 700, position: "absolute", bottom: 0, left: 0, background: "#0008" }}
          >
            {props.info.duration}
          </Text>
        </Box>
        <Text
          icss={{ color: colors.textSecondary, textAlign: "center", fontSize: ".8em", fontWeight: 700, padding: "4px" }}
        >
          {props.info.authorName}
        </Text>
      </Section>

      <Section icss={{ gridArea: "detail" }}>
        <Box icss={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <Box icss={{ display: "flex" }}>
            <Icon src="/icons/bilibili/play.svg"></Icon>
            <Text icss={{ fontSize: ".8em" }}>{props.info.play}</Text>
          </Box>
          <Box icss={{ display: "flex" }}>
            <Icon src="/icons/bilibili/comment.svg"></Icon>
            <Text icss={{ fontSize: ".8em" }}>{props.info.comment}</Text>
          </Box>
        </Box>
      </Section>
    </Card>
  )
}

type CardProps = {
  name: string
}

/**
 * when use card, inner should be a block of info (like image, text, etc.)
 */
function Card(kitProps: KitProps<CardProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Card" })
  return <Box class={props.name} shadowProps={shadowProps}></Box>
}
