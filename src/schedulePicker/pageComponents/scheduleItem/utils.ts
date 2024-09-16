import {
  asyncInvoke,
  createSubscribable,
  createSubscribablePlugin,
  getNow,
  isObject,
  setTimeoutWithSecondes,
  type ID,
  type Subscribable,
} from "@edsolater/fnkit"
import { createIDBStoreManager, createUUID } from "@edsolater/pivkit"
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

/**
 * {@link createSubscribable}‘s plugin
 *
 * sync with indexedDB
 */
const autoCacheInIndexedDB = (options: { dbName?: string; keyName: string }) =>
  createSubscribablePlugin(({ name: subscribableName }) => {
    //#region ---------------- define innerStoreValue and innerScribableValue ----------------
    const innerStoreValue = createSubscribable<any>()
    const innerScribableValue = createSubscribable<any>()
    syncDataBetweenTwoSubscribable(innerStoreValue, innerScribableValue)
    //#endregion

    //#region ---------------- inner state => indexedDB store ----------------
    let currentStoreValue: any
    const idbManager = createIDBStoreManager<any>({
      dbName: options.dbName ?? subscribableName ?? "default",
      onStoreLoaded: async ({ get }) => {
        const storeValue = await get(options?.keyName)
        if (storeValue) {
          innerStoreValue.set(storeValue)
          currentStoreValue = storeValue
        }
      },
    })
    asyncInvoke(() => {
      innerStoreValue.subscribe((storeValue) => {
        if (currentStoreValue !== storeValue) {
          idbManager.set(options.keyName, storeValue)
          currentStoreValue = storeValue
        }
      })
    })
    //#endregion

    return {
      onInit({ self, ...rest }) {
        self.then((self) => {
          //#region ---------------- inner subscribable value => self ----------------
          innerScribableValue.subscribe((syncedStoreValue) => {
            self.set(syncedStoreValue)
          })
          //#endregion
        })
      },
      onSet(value, prevValue) {
        console.log("🎉 plugin autoCacheInIndexedDB: subscribe and set to indexedDB: ", value)
        if (isObject(value) && Object.keys(value).length) {
          innerScribableValue.set(() => value)
        }
      },
    }
  })

/** schedule data holder */
export const dailyScheduleData = createSubscribable<ScheduleSchema>(
  {},
  {
    name: "daily-schedule",
    beforeValueSet: washScheduleSchema,
    plugins: [autoCacheInIndexedDB({ dbName: "daily-schedule", keyName: "store" })],
  },
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
/**
 * sync two subscribable's data
 * @param s1 a subscribable to be sync with s2
 * @param s2 a subscribable to be sync with s1
 * @param options more accurate control utils
 * @example
 * const s1 = createSubscribable(1)
 * const s2 = createSubscribable(2)
 * syncDataBetweenTwoSubscribable(s1, s2)
 * s1.set(3) // s2 will be 3 too
 */
function syncDataBetweenTwoSubscribable<T, U>(
  s1: Subscribable<T>,
  s2: Subscribable<U>,
  options?: {
    /**
     * initly s1 is subscribable<'first'> and s2 is subscribable<'second'>
     * if initValueRespect is '1', s2 will be 'first'
     * if initValueRespect is '2', s1 will be 'second'
     */
    initValueRespect?: "1" | "2" | "auto"
    setFrom1?: (value: T, subscribable2: Subscribable<U>) => void
    setFrom2?: (value: U, subscribable1: Subscribable<T>) => void
  },
) {
  let currentValue =
    options?.initValueRespect === "1"
      ? s1()
      : options?.initValueRespect === "2"
        ? s2()
        : options?.initValueRespect === "auto" || options?.initValueRespect == null
          ? (s1() ?? s2())
          : undefined
  const onSetFrom1 = (v1: T) => {
    console.log("v1: ", v1)
    options && "setFrom1" in options ? options?.setFrom1?.(v1, s2) : s2.set(v1 as any)
  }
  const onSetFrom2 = (v2: U) => {
    console.log("v2: ", v2)
    options && "setFrom2" in options ? options?.setFrom2?.(v2, s1) : s1.set(v2 as any)
  }

  s1.subscribe((v1) => {
    if (v1 !== currentValue) {
      currentValue = v1
      onSetFrom1(v1)
    }
  })
  s2.subscribe((v2) => {
    if (v2 !== currentValue) {
      currentValue = v2
      onSetFrom2(v2)
    }
  })
}
