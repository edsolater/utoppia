import type { Float, ID, TimeStamp } from "@edsolater/fnkit"

type HistoryRecordItem = {
  clockAt: TimeStamp
}

type BasicItem = {
  id: ID // (auto-generated)
  name: string
  comment?: string
  creatTime: TimeStamp // (auto-generated)
  history?: HistoryRecordItem[]
  rating?: Float<0, 5>
  icon?: string // can be base64 or url
}

export type ScheduleLinkItem = BasicItem & {
  url?: string
  // determine outside looks layout
  is: "link"
  // determine outside looks color
  tag?: string
}

export type ScheduleTextItem = BasicItem & {
  // determine outside looks layout
  is: "text"
}
