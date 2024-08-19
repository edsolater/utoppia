import { parseDate, type TimeStamp } from "@edsolater/fnkit"
import {
  Box,
  createDisclosure,
  cssOpacity,
  Fragnment,
  Icon,
  icssCard,
  icssClickable,
  Iframe,
  Image,
  List,
  Modal,
  Panel,
  Section,
  Text,
  Title,
  useKitProps,
  type KitProps,
} from "@edsolater/pivkit"
import { createEffect, createResource, createSignal, Show } from "solid-js"
import { colors } from "../app/theme/colors"
import { serverOrigin } from "./configs/env"
import type { BriefVideoInfo } from "./data/briefVedioInfo"
import { bilibiliStore } from "./fetchData"

/**
 * Renders the VideoCollectorPage component.
 * This component fetches and displays a list of videos from the bilibiliStore.
 */
export default function VideoCollectorPage() {
  const [videoList, videoListResourceUtils] = createResource(() => bilibiliStore.getVideos())

  const [currentInfo, setCurrentInfo] = createSignal<BriefVideoInfo>()
  return (
    <Fragnment>
      <Modal open={() => Boolean(currentInfo())} onClose={() => setCurrentInfo(undefined)}>
        <BilibiliPlayer video={currentInfo()} />
      </Modal>

      <List
        items={videoList()}
        icss={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",
          gap: "16px",
        }}
      >
        {(briefVideo) => <BriefVideoInfoCard video={briefVideo} onClickTitle={(info) => setCurrentInfo(info)} />}
      </List>
    </Fragnment>
  )
}

function BilibiliPlayer(props: { video: BriefVideoInfo | undefined }) {
  return (
    <Panel icss={{ padding: "1em", background: colors.appPanel }}>
      <Title>{props.video?.title}</Title>

      <Show when={props.video}>
        <Iframe
          size={"lg"}
          src={`https://player.bilibili.com/player.html?bvid=${props.video?.bvid}&autoplay=1&muted=0&danmaku=0`}
        ></Iframe>
      </Show>
    </Panel>
  )
}

/**
 * Renders a card displaying brief information about a video.
 * @param props - The props containing the video information.
 */
function BriefVideoInfoCard(props: { video: BriefVideoInfo; onClickTitle: (info: BriefVideoInfo) => void }) {
  // const thumbnailSrc = `https://i2.hdslb.com/bfs/archive/bdb840f1fb337adac124f41e3fe4f264331ec19b.jpg`
  const thumbnailSrc = `${serverOrigin}/bilibili/img-proxy?url=${props.video.thumbnail}@672w_378h_1c_!web-home-common-cover.avif`
  const authorFaceSrc = `${serverOrigin}/bilibili/img-proxy?url=${props.video.authorFace}@96w_96h_1c_1s_!web-avatar.avif`
  const [watched, { open: flagIsWatched, toggle: toggleTheWatchedFlag }] = createDisclosure(
    () => Boolean(props.video.watched),
    {
      onOpen: () => bilibiliStore.flagVideoWatched(props.video.bvid),
      onClose: () => bilibiliStore.flagVideoUnwatched(props.video.bvid),
    },
  )
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
          "title  title    " auto
          "author thumbnail" auto
          "detail thumbnail" auto / 3fr 1fr`,
          gap: ".25em",
        },
      ]}
    >
      <Section icss={{ gridArea: "title" }}>
        <Text icss={icssClickable} onClick={() => toggleTheWatchedFlag()}>
          {watched() ? "✅" : "✨"}
        </Text>
        <Text
          icss={{
            marginInline: "8px",
            fontSize: "1em",
            border: "solid",
            minWidth: "2em",
            borderRadius: ".5em",
            display: "inline grid",
            placeContent: "center",
            paddingInline: ".25em",
          }}
        >
          {props.video.score}
        </Text>

        <Text
          icss={[{ color: colors.textLink }, icssClickable()]}
          // href={`https://www.bilibili.com/video/${props.info.bvid}`}
          onClick={() => {
            // flagIsWatched() // temporary don't affect the watched status
            props.onClickTitle(props.video)
          }}
        >
          {props.video.title}
        </Text>

        <Text icss={{ display: "inline-block", fontSize: "1em", color: colors.textSecondary }}>
          【<DateStamp timeStamp={props.video.pubdate} />】
        </Text>
      </Section>

      <Section icss={{ gridArea: "thumbnail", alignSelf: "center", justifySelf: "end" }}>
        <Box icss={{ display: "flex", gap: "8px", flexDirection: "column", alignItems: "end" }}>
          <Box icss={{ position: "relative" }}>
            <Image
              src={thumbnailSrc}
              icss={{ width: "100px", aspectRatio: "16 / 9", objectFit: "cover", borderRadius: "4px" }}
            />
            <Text
              icss={{
                fontSize: ".8em",
                fontWeight: 700,
                position: "absolute",
                bottom: 0,
                left: 0,
                background: "#0008",
              }}
            >
              {toTimeLengthString(props.video.duration)}
            </Text>
          </Box>
        </Box>
      </Section>

      <Section icss={{ gridArea: "author" }}>
        <Box icss={{ display: "flex", gap: ".25em", alignItems: "center" }}>
          <Show when={props.video.authorFace}>
            <Image
              src={authorFaceSrc}
              icss={{ width: "1em", height: "1em", borderRadius: "50%", objectFit: "cover" }}
            ></Image>
          </Show>
          <Text
            icss={{
              color: colors.textSecondary,
              textAlign: "center",
              fontSize: ".8em",
              fontWeight: 700,
              padding: "4px",
            }}
          >
            {props.video.authorName}
          </Text>
        </Box>
      </Section>

      <Section icss={{ gridArea: "detail", fontSize: ".75em" }}>
        <Box icss={{ display: "flex", gap: "1em", flexWrap: "wrap" }}>
          <Box icss={{ display: "flex", gap: ".125em" }}>
            <Icon src="/icons/bilibili/play.svg"></Icon>
            <Text>{props.video.play}</Text>
          </Box>
          <Box icss={{ display: "flex", gap: ".125em" }}>
            <Icon src="/icons/bilibili/comment.svg"></Icon>
            <Text>{props.video.comment}</Text>
          </Box>
          <Show when={props.video.like}>
            <Box icss={{ display: "flex", gap: ".125em" }}>
              {/* TODO: why css fontSize not work */}
              <Icon src="/icons/bilibili/like.svg"></Icon>
              <Text>{props.video.like}</Text>
            </Box>
          </Show>
          <Show when={props.video.favorite}>
            <Box icss={{ display: "flex", gap: ".125em" }}>
              {/* TODO: why css fontSize not work */}
              <Icon src="/icons/bilibili/favorite.svg"></Icon>
              <Text>{props.video.favorite}</Text>
            </Box>
          </Show>
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

/**
 * Converts a timestamp to a formatted date string.
 *
 * @param timeStamp - The timestamp to convert.
 * @param options - Optional configuration for the conversion.
 * @param options.withTime - Whether to include the time in the formatted date string.
 * @returns The formatted date string.
 */
function toDateString(timeStamp: TimeStamp, options?: { withTime?: boolean }) {
  const dateInfo = parseDate(timeStamp)
  const getDateString = () => `${dateInfo.year}-${dateInfo.month}-${dateInfo.day}`
  const getTimeString = () => `${dateInfo.hours}:${dateInfo.minutes}:${dateInfo.seconds}`
  return options?.withTime ? `${getDateString()} ${getTimeString()}` : getDateString()
}

type DateStampProps = {
  timeStamp: TimeStamp
}

/**
 * **Component**
 *
 * to show date string
 * for easier to read
 */
function DateStamp(kitProps: KitProps<DateStampProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DateStamp" })
  return <Text shadowProps={shadowProps}>{toDateString(props.timeStamp)}</Text>
}

/**
 * Converts a given number of seconds into a formatted time length string.
 *
 * @param seconds - The number of seconds to convert.
 * @returns The formatted time length string.
 * @example
 * toTimeLengthString(90);//=> Returns "1:30"
 * toTimeLengthString(7530); //=> Returns "2:05:30"
 */
function toTimeLengthString(seconds: number) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const sec = Math.floor(seconds % 60)
  return `${hours ? hours + ":" : ""}${minutes.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
}
