import type { Url, ID, TimeStamp } from "@edsolater/fnkit"

export type BriefVideoInfo = {
  id: ID // (an alias of bvid)
  /** 视频封面 */
  thumbnail: Url

  /** 视频bvid */
  bvid: string
  /** 作者ID */
  mid: ID
  /** 作者名字 */
  authorName: string
  /** 作者头像 */
  authorFace?: Url

  /** 分区号 */
  tid: number
  /** 播放次数 */
  play: number
  /** 评论数 */
  comment: number
  /** 视频时长 */
  duration: number
  /** 视频标题 */
  title: string
  /** 视频发布时间(s) */
  pubdate: TimeStamp
  /** 视频副标题 */
  subtitle?: string
  /** 视频介绍 */
  description?: string

  /** 点赞数 */
  like?: number
  /** 收藏数 */
  favorite?: number
  /** 投币数 */
  coin?: number
  /** 系列合集 */
  meta?: {
    /** 合集名字 */
    title: string
    intro: string
    /** 合集的总数 */
    count: number
  }

  /** AI 评分 */
  score?: number // (1.0-10.0) 1.00分代表价值相对低，视频很可能是标题党，10.00分代表价值极高，视频非常有一看的必要

  /** 评分的时间戳 */
  scoreAt?: TimeStamp

  /** 是否已经观看过 */
  watched?: boolean
}
