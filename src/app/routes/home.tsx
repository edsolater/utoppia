import { Box } from "@edsolater/pivkit"
import { Link } from "../components/Link"
import { bilibiliStore } from "../../vedioCollector/fetchData"

export default function HomePage() {
  const videoResource = bilibiliStore.ups.getVideos({ mid: "94727573" })
  videoResource.then((data) => console.log(data))
  return (
    <Box>
      <Link href={"/playground"} innerRoute>
        Playground
      </Link>
    </Box>
  )
}
