import type { Url, ID, TimeStamp } from "@edsolater/fnkit"

export type BriefVedioInfo = {
  id: ID // (an alias of bvid)
  thumbnail: Url

  bvid: string
  mid: ID
  authorName: string
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

  subtitle?: string
  description: string

  /** 点赞数 */
  like?: number
  /** 收藏数 */
  favorite?: number
  /** 投币数 */
  coin?: number
  /** 系列合集 */
  meta?: {
    title: string
    intro: string
    /** 合集的总数 */
    count: number
  }

  /** for AI to analyse
   *
   */
  signatureText: string
}
