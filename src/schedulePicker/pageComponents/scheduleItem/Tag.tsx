import { createSubscribable, isShallowEqual, isSubCollectorOf, setItem } from "@edsolater/fnkit"
import {
  type KitProps,
  Box,
  createIDBStoreManager,
  createUUID,
  icssCardPanel,
  Input,
  Loop,
  Piv,
  useKitProps,
  useSubscribable,
} from "@edsolater/pivkit"
import { createEffect, createSignal, on } from "solid-js"
import { popupWidget } from "./popupWidget"
import { type SelectPanelProps, SelectPanel } from "./Select"

const recordTagCandidates: Map<string /* candidateKey */, string[]> = new Map()
type TagAtomProps = {
  bg?: string
  defaultValue?: string
  value?: string
}

type TagWidgetProps = TagAtomProps & {
  candidates?: string[]
  onChange?: SelectPanelProps<string>["onSelect"]
  candidateKey?: string
}

type TagRowProps = {
  value?: string[]
  defaultValue?: string[]
  bg?: string // icss:bg
  candidates?: string[] // apply to all tags
  onChange?: (newTags: string[]) => void
  candidateKey: string
}

/**
 * TODO: should normalized and move to pivkit
 * - temporary just simple  mode, feature:multiple mode is ongoing
 * just a special type of `<Text>`
 *
 */
export function TagWidget(kitProps: KitProps<TagWidgetProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagWidget" })
  const candidates = () => props.candidates ?? recordTagCandidates.get(props.candidateKey ?? "") ?? []
  return (
    <TagAtom
      shadowProps={shadowProps}
      plugin={popupWidget.config({
        shouldFocusChildWhenOpen: true,
        canBackdropClose: true,
        popElement: ({ closePopup }) => (
          <Box icss={[icssCardPanel, { paddingBlock: "8px", borderRadius: "8px" }]}>
            <Input
              icss={{ marginBottom: ".5em" }}
              onEnter={(value) => {
                if (value) {
                  recordTagCandidates.set(props.candidateKey ?? "", [...candidates(), value])
                }
              }}
            />
            <SelectPanel
              name="category-selector"
              variant={"no-style"}
              candidates={candidates}
              defaultValue={props.defaultValue}
              onClose={closePopup}
              onSelect={(...e) => {
                return props.onChange?.(...e)
              }}
            />
          </Box>
        ),
      })}
    />
  )
}

/** just a pure <div> */
export function TagAtom(kitProps: KitProps<TagAtomProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagAtom" })
  const defaultTagBg = "#888"
  return (
    <Piv
      shadowProps={shadowProps}
      icss={[
        {
          display: "block",
          padding: ".125rem .5rem",
          background: props.bg ?? defaultTagBg,
          width: "fit-content",
          minWidth: "2em",
          minHeight: "calc(1lh + .125em * 2)",
          borderRadius: ".25rem",
          textAlign: "center",
        },
      ]}
    >
      {props.value}
    </Piv>
  )
}

const defaultTagBg = "light-dark(#fff6, #0006)"

// ---------------- availableTags in indexedDB ----------------
const idbManager = createIDBStoreManager({
  dbName: "form-widget-settings",
  storeName: "tags",
})
const availableTags = createSubscribable<Map<string, Set<string> | undefined>>(new Map(), {
  onSet(value, prevValue) {
    // console.log('set 0', value, prevValue)
    for (const [key, tags] of value) {
      const prevTags = prevValue?.get(key)
      if (!isSubCollectorOf(prevTags, tags)) {
        // console.log("idb set tags: ", tags, prevTags)
        idbManager.set(key, tags)
      }
    }
  },
  onInit({ set }) {
    // console.log("idb init")
    idbManager.getAll().then((data) => {
      // console.log("idb init: ", data)
      set((prev) => {
        // console.log("prev, data: ", prev, data)
        if (isShallowEqual(data, prev) || isSubCollectorOf(prev, data)) return prev
        return new Map(data?.map(({ key, value: tags }) => [key as string, new Set(tags)]))
      })
    })
  },
})

/**
 * Uikit Component (for form)
 *
 * multi Tags (tag input list)
 *
 */
export function TagRow(kitProps: KitProps<TagRowProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagsLine" })
  const [innerSelectedTags, setInnerSelectedTags] = createSignal(props.value)
  const [candidates, setCandidates] = useSubscribable(availableTags, {
    onPickFromSubscribable: (subscribable) => {
      // console.log('pick')
      const pickedValue = subscribable.get(props.candidateKey)
      return pickedValue
    },
    onSetToSubscribable: (tags, subscribable) => {
      // console.log("onSet tags: ", subscribable(), tags)
      if (!tags?.size) return
      if (isSubCollectorOf(subscribable().get(props.candidateKey), tags)) return
      // console.log("real set tags: ", subscribable(), tags)
      subscribable.set((prev) => {
        const newMap = new Map(prev)
        setItem(newMap, props.candidateKey, (storeTags) => new Set([...(storeTags ?? []), ...tags]))
        return newMap
      })
    },
  })

  // apply onChange callbacks
  createEffect(
    on(
      innerSelectedTags,
      (currentInnerTags) => {
        // console.log("currentInnerTags: ", currentInnerTags)
        if (currentInnerTags) props.onChange?.(currentInnerTags)
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

  return (
    <Box
      shadowProps={shadowProps}
      icss={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}
      plugin={popupWidget.config({
        shouldFocusChildWhenOpen: true,
        canBackdropClose: true,
        popElement: ({ closePopup }) => (
          <Box icss={[icssCardPanel, { paddingBlock: "8px", borderRadius: "8px" }]}>
            <Input
              icss={{ marginBottom: ".5em" }}
              onEnter={(value) => {
                if (value) {
                  setCandidates((prev) => {
                    const s = new Set(prev)
                    s.add(value)
                    return s
                  })
                }
              }}
            />
            <SelectPanel
              name="tag-row-selector"
              variant={"no-style"}
              candidates={candidates}
              onClose={closePopup}
              onSelect={({ itemValue }) => {
                setInnerSelectedTags((prev) => prev?.concat(itemValue()))
              }}
            />
          </Box>
        ),
      })}
    >
      <Loop items={innerSelectedTags}>
        {(tag: string, idx) => (
          <Box icss={{ position: "relative" }}>
            {/* <Piv
              icss={[
                {
                  position: "absolute",
                  top: 0,
                  right: 0,
                  translate: "50% -50%",
                  zIndex: 1,
                  background: "#0002",
                  borderRadius: "50%",
                  padding: ".25rem",
                  scale: ".5",
                  transition: "all 300ms",
                },
                icssClickable(),
              ]}
              onClick={() => {
                setInnerData((prev) => prev?.filter((_, i) => i !== idx()))
              }}
            >
              <Icon src="/icons/close.svg" />
            </Piv> */}
            <TagAtom bg={props.bg ?? defaultTagBg} value={tag} defaultValue={tag}>
              {tag}
            </TagAtom>
          </Box>
        )}
      </Loop>

      {/* <Icon
        icss={[icssClickable(), { color: colors.textTernary, alignSelf: "center", opacity: 0.5 }]}
        src="/icons/add.svg"
        onClick={() => {
          setInnerData((prev) => [...(prev ?? []), ""])
        }}
      /> */}
    </Box>
  )
}
