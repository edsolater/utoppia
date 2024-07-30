import type { AnyObj } from "@edsolater/fnkit"
import { jFetch } from "@edsolater/pivkit"
import type { BriefVedioInfo } from "./data/briefVedioInfo"
import { serverOrigin } from "./configs/env"

/**
 *
 */
export const bilibiliStore = {
  ups: {
    getVideos: async () => jFetch<BriefVedioInfo[]>(`${serverOrigin}/bilibili/show-me-videos`),
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
