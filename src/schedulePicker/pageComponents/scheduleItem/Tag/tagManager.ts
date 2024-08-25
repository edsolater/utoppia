import { addItem, createSubscribable, isSubCollectorOf, setItem } from "@edsolater/fnkit"
import { useKitProps, useSubscribable, type KitProps } from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"

// ---------------- candidates in indexedDB ----------------
// TODO: current don't think indexedDB. it is also a big trouble
// const idbManager = createIDBStoreManager({
//   dbName: "form-widget-settings",
//   storeName: "tags",
// })

const availableTags = createSubscribable<Map<string, Set<string> | undefined>>(new Map(), {
  // onSet(value, prevValue) {
  //   // console.log('set 0', value, prevValue)
  //   for (const [key, tags] of value) {
  //     const prevTags = prevValue?.get(key)
  //     if (!isSubCollectorOf(prevTags, tags)) {
  //       // console.log("idb set tags: ", tags, prevTags)
  //       idbManager.set(key, tags)
  //     }
  //   }
  // }, // TODO: current don't think indexedDB. it is also a big trouble
  // onInit({ set }) {
  //   // console.log("idb init")
  //   idbManager.getAll().then((data) => {
  //     // console.log("idb init: ", data)
  //     set((prev) => {
  //       // console.log("prev, data: ", prev, data)
  //       if (isShallowEqual(data, prev) || isSubCollectorOf(prev, data)) return prev
  //       return new Map(data?.map(({ key, value: tags }) => [key as string, new Set(tags)]))
  //     })
  //   })
  // }, // TODO: current don't think indexedDB. it is also a big trouble
})

/**
 * Single Mode, derived from  {@link useTagsManager}
 *
 * solidjs hook for managing tags(candidate and selected)
 *
 */
export function useTagManager(
  rawOptions: KitProps<{
    candidateGroupName: string
    defaultSelectedTag: string
    defaultCandidates?: string[]
    onSelectedTagChange?: (tag: string) => void
  }>,
) {
  const { props: options } = useKitProps(rawOptions, { name: "useTagManager" })
  const { innerSelectedTags, ...rest } = useTagsManager({
    key: options.candidateGroupName,
    defaultSelectedTags: [options.defaultSelectedTag],
    defaultCandidates: options.defaultCandidates,
    onSelectedTagsChange: (tags: string[]) => options.onSelectedTagChange?.(tags.at(-1)!),
  })
  const innerTag = createMemo(() => innerSelectedTags().at(-1)!)
  return { innerTag, ...rest }
}

/**
 * Multiple Mode, (single mode is {@link useTagsManager})
 * solidjs hook for managing tags(candidate and selected)
 */
export function useTagsManager(
  rawOptions: KitProps<{
    key: string
    defaultSelectedTags: string[]
    onSelectedTagsChange?: (tags: string[]) => void
    // TODO: imply it!!
    defaultCandidates?: string[]
  }>,
) {
  const { props: options } = useKitProps(rawOptions, { name: "useTagsManager" })
  const [innerSelectedTags, setInnerSelectedTags] = createSignal(options.defaultSelectedTags)
  const [candidates, setCandidates] = useSubscribable(availableTags, {
    onPickFromSubscribable: (subscribable) => {
      // console.log('pick')
      const pickedValue = subscribable.get(options.key)
      return pickedValue
    },
    onSetToSubscribable: (tags, subscribable) => {
      // console.log("onSet tags: ", subscribable(), tags)
      if (!tags?.size) return
      if (isSubCollectorOf(subscribable().get(options.key), tags)) return
      // console.log("real set tags: ", subscribable(), tags)
      subscribable.set((prevStore) =>
        setItem(prevStore, options.key, (storeTags) => new Set([...(storeTags ?? []), ...tags])),
      )
    },
  })

  /** tag action */
  const selectTag = (newTagName: string) => setInnerSelectedTags((prev) => prev?.concat(newTagName))

  /** tag action */
  const deleteCandidate = (tagName: string) => setInnerSelectedTags((prev) => prev?.filter((tag) => tag !== tagName))

  /** tag action */
  const addCandidate = (tagName: string) => setCandidates((prev = new Set()) => addItem(prev, tagName))

  // apply onChange callbacks
  createEffect(
    on(
      innerSelectedTags,
      (currentInnerTags) => {
        // console.log("currentInnerTags: ", currentInnerTags)
        if (currentInnerTags) options.onSelectedTagsChange?.(currentInnerTags)
      },
      { defer: true },
    ),
  )

  // copy change current tag to candidates
  createEffect(
    on(innerSelectedTags, (currentInnerTags) => {
      if (currentInnerTags) {
        const candidatesTags = candidates()
        for (const innerTag of currentInnerTags) {
          if (!candidatesTags?.has(innerTag)) {
            setCandidates((prev) => {
              const s = new Set([...(prev ?? [])])
              // console.log("innerTag: ", innerTag, s)
              s.add(innerTag)
              return s
            })
          }
        }
      }
    }),
  )

  return { innerSelectedTags, candidates, setCandidates, selectTag, deleteCandidate, addCandidate }
}
