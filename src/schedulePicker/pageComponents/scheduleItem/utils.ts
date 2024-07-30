import { createSubscribable, getNow, type ID } from "@edsolater/fnkit"
import { createUUID } from "@edsolater/pivkit"
import { ScheduleLinkItem } from "./type"

/**
 * new a ScheduleLinkItem with new default properties
 * @param scheduleItem old ScheduleLinkItem
 * @returns perfectly new ScheduleLinkItem
 */
function washScheduleItem(scheduleItem: Partial<ScheduleLinkItem>): ScheduleLinkItem {
  //@ts-ignore
  return {
    ...scheduleItem,
    id: scheduleItem.id ?? createUUID(),
    name: scheduleItem.name ?? "",
    url: scheduleItem.url ?? "",
    //@ts-ignore
    tags: scheduleItem.tags || scheduleItem.tag || "",
    //@ts-ignore
    category: scheduleItem.category === "other" ? "video" : scheduleItem.category ?? undefined,
    comment: scheduleItem.comment,
    is: "link",
    creatTime: getNow(),
  }
}

export type ScheduleSchema = {
  links?: ScheduleLinkItem[]
}

function washScheduleSchema(inputRawValue: ScheduleSchema): ScheduleSchema {
  if (inputRawValue.links) {
    inputRawValue.links = inputRawValue.links.map(washScheduleItem)
  }
  return inputRawValue
}

/** schedule data holder */
export const dailyScheduleData = createSubscribable<ScheduleSchema>(
  {},
  { name: "daily-schedule", beforeValueSet: washScheduleSchema },
)

/**
 * in {@link dailySchemaUtils}
 */
function deleteLink(link: ScheduleLinkItem) {
  dailyScheduleData.set((prev) => ({ ...prev, links: prev.links?.filter((l) => l.id !== link.id) }))
}

/** provides utils to operate with schema without know schema's inner structure */
export const dailySchemaUtils = { deleteLink }

export function updateExistedScheduleItem(id: ID, partialNewItem: Partial<ScheduleLinkItem>) {
  dailyScheduleData.set((prev) => ({
    ...prev,
    links: prev.links?.map((l) => (l.id === id ? { ...l, ...partialNewItem } : l)),
  }))
}
