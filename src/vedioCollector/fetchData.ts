import type { AnyObj } from "@edsolater/fnkit"
import { jFetch } from "@edsolater/pivkit"
import type { BriefVedioInfo } from "./data/briefVedioInfo"

/**
 *
 */
export const bilibiliStore = {
  ups: {
    async getVideos(payload: { mid: string }): Promise<BriefVedioInfo[] | undefined> {
      return jFetch(`http://localhost:3000/bilibili/user-video-list?${toQueryString(payload)}`)
    },
  },
}

/**
 *
 * @param queryObj raw param Object
 * @returns
 */
function toQueryString(queryObj: AnyObj) {
  return Object.keys(queryObj)
    .map((key) => `${key}=${queryObj[key]}`)
    .join("&")
}
