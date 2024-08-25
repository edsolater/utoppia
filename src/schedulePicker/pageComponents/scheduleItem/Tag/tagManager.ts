import { addItem, createSubscribable, isSubCollectorOf, setItem } from "@edsolater/fnkit"
import { useSubscribable } from "@edsolater/pivkit"
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
export function useTagManager(opts: {
  candidateGroupName: string
  defaultSelectedTag: string
  defaultCandidates?: string[]
  onSelectedTagChange?: (tag: string) => void
}) {
  const { innerSelectedTags, ...rest } = useTagsManager({
    candidateGroupName: opts.candidateGroupName,
    defaultSelectedTags: [opts.defaultSelectedTag],
    defaultCandidates: opts.defaultCandidates,
    onSelectedTagsChange: (tags: string[]) => opts.onSelectedTagChange?.(tags.at(-1)!),
  })
  const innerTag = createMemo(() => innerSelectedTags().at(-1)!)
  return { innerTag, ...rest }
}

/**
 * Multiple Mode, (single mode is {@link useTagsManager})
 * solidjs hook for managing tags(candidate and selected)
 */
export function useTagsManager(opts: {
  candidateGroupName: string
  defaultSelectedTags: string[]
  onSelectedTagsChange?: (tags: string[]) => void
  // TODO: imply it!!
  defaultCandidates?: string[]
}) {
  const [innerSelectedTags, setInnerSelectedTags] = createSignal(opts.defaultSelectedTags)
  const [candidates, setCandidates] = useSubscribable(availableTags, {
    onPickFromSubscribable: (subscribable) => {
      // console.log('pick')
      const pickedValue = subscribable.get(opts.candidateGroupName)
      return pickedValue
    },
    onSetToSubscribable: (tags, subscribable) => {
      // console.log("onSet tags: ", subscribable(), tags)
      if (!tags?.size) return
      if (isSubCollectorOf(subscribable().get(opts.candidateGroupName), tags)) return
      // console.log("real set tags: ", subscribable(), tags)
      subscribable.set((prevStore) =>
        setItem(prevStore, opts.candidateGroupName, (storeTags) => new Set([...(storeTags ?? []), ...tags])),
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
        if (currentInnerTags) opts.onSelectedTagsChange?.(currentInnerTags)
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
