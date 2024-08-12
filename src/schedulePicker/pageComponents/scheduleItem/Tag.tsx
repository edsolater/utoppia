import {
  type KitProps,
  Box,
  icssCardPanel,
  Input,
  Loop,
  Piv,
  useIDBValue,
  useKitProps,
  useSubscribable,
} from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, on } from "solid-js"
import { popupWidget } from "./popupWidget"
import { type SelectPanelProps, SelectPanel } from "./Select"
import { createSubscribable, setItem } from "@edsolater/fnkit"

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

const availableTags = createSubscribable<Map<string, Set<string>>>(new Map())

export function TagRow(kitProps: KitProps<TagRowProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagsLine" })
  const [innerSelectedTags, setInnerSelectedTags] = createSignal(props.value)
  const [candidates, setCandidates] = useSubscribable(availableTags, {
    pick: (subscribable) => subscribable.get(props.candidateKey) ?? (new Set() as Set<string>),
    set: (tags, subscribable) => {
      subscribable.set((prev) => {
        const next = new Map(prev)
        next.set(props.candidateKey, tags)
        return next
      })
    },
  })

  // apply onChange callbacks
  createEffect(
    on(
      innerSelectedTags,
      (currentInnerData) => {
        if (currentInnerData) props.onChange?.(currentInnerData)
      },
      { defer: true },
    ),
  )
  // //
  // createEffect(
  //   on(innerSelectedTags, (currentInnerData) => {
  //     if (currentInnerData) {
  //       setAvailableTags((prev) => {
  //         const next = new Map(prev)
  //         setItem(next, props.candidateKey, (prev) =>
  //           prev ? new Set([...prev, ...currentInnerData]) : new Set(currentInnerData),
  //         )
  //         return next
  //       })
  //     }
  //   }),
  // )

  // const candidates = () => props.candidates ?? recordTagCandidates.get(props.candidateKey ?? "") ?? []
  // TODO: temporary use string
  // const [candidatesString, _setCandidates] = useStorageValue({
  //   key: props.candidateKey ?? "",
  //   defaultValue: props.candidates?.join(","),
  // })
  // createEffect(() => {
  //   console.log("candidatesString: ", candidatesString())
  // })

  // const candidates = pipeFns(candidatesString, (s) => s?.split(",") ?? [])
  // const setCandidates = (n: any) => {
  //   if (isFunction(n)) {
  //     _setCandidates(n(candidates()))
  //   } else {
  //     _setCandidates(n)
  //   }
  // }

  // // FIXME: why not work?
  // const [candidates, setCandidates] = useIDBValue<string[]>({
  //   dbName: "tag-row",
  //   key: props.candidateKey,
  //   defaultValue: props.candidates ?? [],
  // })

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
                  // recordTagCandidates.set(props.candidateKey ?? "", [...candidates(), value])
                  console.log("value: ", value)
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
