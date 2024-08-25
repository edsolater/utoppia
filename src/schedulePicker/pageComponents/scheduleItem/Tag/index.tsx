import {
  type KitProps,
  Box,
  Icon,
  icssCardPanel,
  icssClickable,
  Input,
  Loop,
  Piv,
  useKitProps,
} from "@edsolater/pivkit"
import { type JSXElement, createEffect, createSignal } from "solid-js"
import { popupWidget } from "../popupWidget"
import { SelectPanel } from "../Select"
import { useTagManager, useTagsManager } from "./tagManager"

type TagWidgetProps = TagAtomProps & {
  candidates?: string[]
  onChange?: (newTag: string) => void
  key?: string
}

type TagRowProps = {
  value?: string[]
  defaultValue?: string[]
  bg?: string // icss:bg
  candidates?: string[] // apply to all tags
  onChange?: (newTags: string[]) => void
  /** candidates will default be candidates with same candidateKey */
  key?: string
}

/**
 * TODO: should normalized and move to pivkit
 * - temporary just simple  mode, feature:multiple mode is ongoing
 * just a special type of `<Text>`
 *
 */
export function TagWidget(kitProps: KitProps<TagWidgetProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagWidget" })
  const { innerTag, candidates, selectTag, deleteCandidate, addCandidate } = useTagManager({
    candidateGroupName: props.key ?? "unknown",
    defaultSelectedTag: props.value ?? props.defaultValue ?? "",
    onSelectedTagChange: (tag) => props.onChange?.(tag),
    defaultCandidates: props.candidates,
  })
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
                  addCandidate(value)
                }
              }}
            />
            <SelectPanel
              name="category-selector"
              variant={"no-style"}
              candidates={candidates}
              defaultValue={props.defaultValue}
              onClose={closePopup}
              onSelect={({ itemValue }) => {
                selectTag(itemValue())
              }}
            />
          </Box>
        ),
      })}
    />
  )
}

type TagAtomProps = {
  bg?: string
  defaultValue?: string
  value?: string
  renderSuffix?: JSXElement
}
/** just a pure <div> */
export function TagAtom(kitProps: KitProps<TagAtomProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagAtom" })
  const defaultTagBg = "#888"
  return (
    <Piv
      shadowProps={shadowProps}
      defineLastChild={props.renderSuffix}
      icss={[
        {
          display: "flex",
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
      {props.value ?? props.children}
    </Piv>
  )
}

const defaultTagBg = "light-dark(#fff6, #0006)"

/**
 * Uikit Component (for form)
 *
 * multi Tags (tag input list)
 *
 */
export function TagRow(kitProps: KitProps<TagRowProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagsLine" })
  const { innerSelectedTags, candidates, selectTag, deleteCandidate, addCandidate } = useTagsManager({
    key: () => props.key ?? "unknown",
    defaultSelectedTags: props.value ?? props.defaultValue ?? [],
    onSelectedTagsChange: props.onChange,
    defaultCandidates: props.candidates,
  })

  const [isPopupOpen, setIsPopupOpen] = createSignal(false)

  return (
    <Box
      shadowProps={shadowProps}
      icss={{
        display: "flex",
        flexWrap: "wrap",
        gap: ".5rem",
        background: isPopupOpen() ? "#0002" : "transparent",
        padding: ".25rem",
        margin: "-.25rem",
        borderRadius: ".25rem",
      }}
      plugin={popupWidget.config({
        onOpen: () => setIsPopupOpen(true),
        onClose: () => setIsPopupOpen(false),
        shouldFocusChildWhenOpen: true,
        canBackdropClose: true,
        popElement: ({ closePopup }) => (
          <Box icss={[icssCardPanel, { paddingBlock: "8px", borderRadius: "8px" }]}>
            <Input
              icss={{ marginBottom: ".5em" }}
              onEnter={(value) => {
                if (value) {
                  addCandidate(value)
                }
              }}
            />
            <SelectPanel
              name="tag-row-selector"
              variant={"no-style"}
              candidates={candidates}
              onClose={closePopup}
              onSelect={({ itemValue }) => {
                selectTag(itemValue())
              }}
            />
          </Box>
        ),
      })}
    >
      <Loop items={innerSelectedTags} fallbackItem={undefined}>
        {(tag: string | undefined) => (
          <Box icss={{ position: "relative" }} class={"tag"}>
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
            <TagAtom
              icss={isPopupOpen() ? undefined : icssClickable()}
              bg={props.bg ?? defaultTagBg}
              renderSuffix={
                <Icon
                  icss={isPopupOpen() && tag ? icssClickable() : { display: "none" }}
                  onClick={() => {
                    if (tag) deleteCandidate(tag)
                  }}
                  src={"/icons/close.svg"}
                />
              }
            >
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
