import { addDefaultProperties, shakeNil } from "@edsolater/fnkit"
import { createUUID } from "@edsolater/pivkit"
import { ScheduleLinkItem } from "./type"
import { createSubscribable } from "@edsolater/fnkit"

/**
 * new a ScheduleLinkItem with new default properties
 * @param scheduleItem old ScheduleLinkItem
 * @returns perfectly new ScheduleLinkItem
 */
export function washScheduleItem(scheduleItem: Partial<ScheduleLinkItem>): ScheduleLinkItem {
  return addDefaultProperties(
    scheduleItem,
    shakeNil({
      id: scheduleItem.id ?? createUUID(),
      name: scheduleItem.name ?? "",
      url: scheduleItem.url ?? "",
      tag: scheduleItem.tags ?? "",
      category: scheduleItem.category ?? "other",
      comment: scheduleItem.comment,
      is: "link",
      creatTime: Date.now(),
    }),
  )
}

export type ScheduleSchema = {
  links?: ScheduleLinkItem[]
}

export function washScheduleSchema(inputRawValue: ScheduleSchema): ScheduleSchema {
  if (inputRawValue.links) {
    inputRawValue.links = inputRawValue.links.map(washScheduleItem)
  }
  return inputRawValue
}

/** schedule data holder */
export const dailyScheduleData = createSubscribable<ScheduleSchema>({}, { beforeValueSet: washScheduleSchema })

/** provides utils to operate with schema without know schema's inner structure */
export const dailySchemaUtils = {
  deleteLink: (link: ScheduleLinkItem) => {
    dailyScheduleData.set((prev) => ({ ...prev, links: prev.links?.filter((l) => l.id !== link.id) }))
  },
}
