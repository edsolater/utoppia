import type { AnyObj } from "@edsolater/fnkit"
import { jFetch } from "@edsolater/pivkit"
import type { BriefVedioInfo } from "./data/briefVedioInfo"

/**
 *
 */
export const bilibiliStore = {
  ups: {
    getVideos: async (payload: { mid: string }): Promise<BriefVedioInfo[] | undefined> =>
      jFetch(`http://localhost:3000/bilibili/user-video-list?${toQueryString(payload)}`),
    getPopularVideos: async (): Promise<BriefVedioInfo[] | undefined> =>
      jFetch(`http://localhost:3000/bilibili/popular`),
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
