import { bilibiliStore } from "./fetchData"

export default function VideoCollectorPage() {
  const videoResource = bilibiliStore.ups.getVideos({ mid: "94727573" })
  videoResource.then((data) => console.log(data))
  return null
}
