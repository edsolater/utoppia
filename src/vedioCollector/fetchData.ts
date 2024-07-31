import type { AnyObj } from "@edsolater/fnkit"
import { jFetch } from "@edsolater/jfetch"
import { serverOrigin } from "./configs/env"
import type { BriefVideoInfo } from "./data/briefVedioInfo"

/**
 *
 */
export const bilibiliStore = {
  getVideos: async () => jFetch<BriefVideoInfo[]>(`${serverOrigin}/bilibili/show-me-videos`),
  flagVideoWatched: async (bvid: string) => jFetch(`${serverOrigin}/bilibili/flag?bvid=${bvid}&watched=true`),
  flagVideoUnwatched: async (bvid: string) => jFetch(`${serverOrigin}/bilibili/flag?bvid=${bvid}&watched=false`),
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
