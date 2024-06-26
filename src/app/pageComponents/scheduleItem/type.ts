import type { Float, ID, TimeStamp } from "@edsolater/fnkit"

type HistoryRecordItem = {
  clockAt: TimeStamp
}

export type ScheduleItem = {
  id: ID // (auto-generated)
  name: string
  comment?: string
  creatTime: TimeStamp // (auto-generated)
  history?: HistoryRecordItem[]
  rating?: Float<0, 5>
  icon?: string // can be base64 or url

  is: string
  category?: string // classic
}

export type ScheduleLinkItemCategories = "video" | "resource"

export const scheduleLinkItemCategories = ["video", "resource"] as ScheduleLinkItemCategories[]

export type ScheduleLinkItem = ScheduleItem & {
  url?: string
  // determine outside looks layout
  is: "link"
  // determine outside looks color
  category?: ScheduleLinkItemCategories
  tags?: string
}

export type ScheduleTextItem = ScheduleItem & {
  // determine outside looks layout
  is: "text"
  category?: string
}
