import { createSubscribable, getNow, type ID } from "@edsolater/fnkit"
import { createUUID } from "@edsolater/pivkit"
import { ScheduleLinkItem } from "./type"

/**
 * new a ScheduleLinkItem with new default properties
 * @param scheduleItem old ScheduleLinkItem
 * @returns perfectly new ScheduleLinkItem
 */
function washScheduleItemFromOld(scheduleItem: Partial<ScheduleLinkItem>): ScheduleLinkItem {
  //@ts-ignore
  return {
    ...scheduleItem,
    //@ts-ignore
    tags: scheduleItem.tags?.[0] === scheduleItem.category ? (scheduleItem.tags?.slice(1) ?? []) : scheduleItem.tags,
    //@ts-ignore
    category: scheduleItem.category === "other" ? "video" : (scheduleItem.category ?? undefined),
    comment: scheduleItem.comment,
    creatTime: getNow(),
  }
}

export type ScheduleSchema = {
  links?: ScheduleLinkItem[]
}

function washScheduleSchema(inputRawValue: ScheduleSchema): ScheduleSchema {
  if (inputRawValue.links) {
    inputRawValue.links = inputRawValue.links.map(washScheduleItemFromOld)
  }
  return inputRawValue
}

/** schedule data holder */
export const dailyScheduleData = createSubscribable<ScheduleSchema>(
  {},
  { name: "daily-schedule", beforeValueSet: washScheduleSchema },
)

/**
 * a dailySchema util
 */
export function deleteLinkScheduleItem(link: ScheduleLinkItem) {
  dailyScheduleData.set((prev) => ({ ...prev, links: prev.links?.filter((l) => l.id !== link.id) }))
}

/**
 * a dailySchema util
 *
 * create an emty link item and add it to the dailySchema
 * @returns the new link item's id
 */
export function createNewLinkScheduleItem(): ID {
  const itemId = createUUID()
  dailyScheduleData.set((prev) => ({ ...prev, links: [...(prev.links ?? []), { id: itemId }] }))
  return itemId
}

export function updateExistedScheduleItem(id: ID, partialNewItem: Partial<ScheduleLinkItem>) {
  dailyScheduleData.set((prev) => ({
    ...prev,
    links: prev.links?.map((l) => (l.id === id ? { ...l, ...partialNewItem } : l)),
  }))
}
