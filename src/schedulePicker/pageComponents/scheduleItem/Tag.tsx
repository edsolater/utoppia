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
import { createEffect, createSignal, on } from "solid-js"
import { colors } from "../../../app/theme/colors"
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
  candidateKey?: string
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

export function TagRow(kitProps: KitProps<TagRowProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagsLine" })
  const [innerData, setInnerData] = createSignal(props.value)
  // apply onChange callbacks
  createEffect(
    on(
      innerData,
      (currentInnerData) => {
        if (currentInnerData) props.onChange?.(currentInnerData)
      },
      { defer: true },
    ),
  )

  return (
    <Box shadowProps={shadowProps} icss={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
      <Loop items={innerData}>
        {(tag: string, idx) => (
          <Box icss={{ position: "relative" }}>
            <Piv
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
            </Piv>
            <TagWidget
              bg={props.bg ?? defaultTagBg}
              candidates={props.candidates}
              value={tag}
              defaultValue={tag}
              // icss={{ textTransform: "capitalize" }}
              onChange={({ itemValue }) => {
                setInnerData((prev) => prev?.map((t, i) => (i === idx() ? itemValue() : t)))
              }}
              candidateKey={props.candidateKey}
            >
              {tag}
            </TagWidget>
          </Box>
        )}
      </Loop>

      <Icon
        icss={[icssClickable(), { color: colors.textTernary, alignSelf: "center", opacity: 0.5 }]}
        src="/icons/add.svg"
        onClick={() => {
          setInnerData((prev) => [...(prev ?? []), ""])
        }}
      />
    </Box>
  )
}
