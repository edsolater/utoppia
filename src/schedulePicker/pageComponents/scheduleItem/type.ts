import type { Float, ID, TimeStamp } from "@edsolater/fnkit"

type HistoryRecordItem = {
  clockAt: TimeStamp
}

export type ScheduleItem = {
  id: ID // (auto-generated)
  name?: string
  // determine outside looks color
  category?: string
  tags?: string[]
  comment?: string
  creatTime?: TimeStamp // (auto-generated)
  history?: HistoryRecordItem[]
  rating?: Float<0, 5>
  icon?: string // can be base64 or url

  is?: string
}

export type ScheduleLinkItemCategories = "video" | "resource" | "ai" | "article" | "up主"

// should can dynamic create by user, like notion
export const scheduleLinkItemCategories = [
  "video",
  "resource",
  "ai",
  "article",
  "up主",
] satisfies ScheduleLinkItemCategories[]

export type ScheduleLinkItem = ScheduleItem & {
  url?: string
  // determine outside looks layout
  is?: "link"
}

export type ScheduleTextItem = ScheduleItem & {
  // determine outside looks layout
  is: "text"
}
