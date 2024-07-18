import type { AnyObj } from "@edsolater/fnkit"
import { jFetch } from "@edsolater/pivkit"

/**
 *
 */
export const bilibiliStore = {
  ups: {
    async getVideos(payload: { mid: string }) {
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
