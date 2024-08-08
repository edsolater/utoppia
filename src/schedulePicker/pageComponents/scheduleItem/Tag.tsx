import { type KitProps, icssClickable, List, Text, useKitProps } from "@edsolater/pivkit"
import { createEffect, createSignal, on } from "solid-js"
import { colors } from "../../../app/theme/colors"
import { popupWidget } from "./popupWidget"
import { type SelectPanelProps, SelectPanel } from "./Select"

/**
 * TODO: should normalized and move to pivkit
 * - temporary just simple  mode, feature:multiple mode is ongoing
 * just a special type of `<Text>`
 *
 */
export function Tag(
  kitProps: KitProps<{
    bg?: string
    candidates: string[]
    defaultValue?: string
    value?: string
    onChange?: SelectPanelProps<string>["onSelect"]
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Tag" })
  const defaultTagBg = "#888"
  return (
    <Text
      shadowProps={shadowProps}
      icss={[
        {
          gridArea: "category",
          color: colors.textPrimary,
          padding: "2px 8px",
          background: props.bg ?? defaultTagBg,
          width: "fit-content",
          minWidth: "3em",
          borderRadius: "4px",
          textAlign: "center",
        },
        icssClickable,
      ]}
      plugin={popupWidget.config({
        shouldFocusChildWhenOpen: true,
        canBackdropClose: true,
        popElement: ({ closePopup }) => (
          <SelectPanel
            name="category-selector"
            candidates={props.candidates}
            defaultValue={props.defaultValue}
            onClose={closePopup}
            onSelect={props.onChange}
          />
        ),
      })}
    >
      {props.value ?? " "}
    </Text>
  )
}

const defaultTagBg = "light-dark(#fff6, #0006)"
export function TagRow(
  kitProps: KitProps<{
    value: string[]
    defaultValue?: string[]
    bg?: string // icss:bg
    candidates?: string[] // apply to all tags
    onChange?: (newTags: string[]) => void
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TagsLine" })

  const [innerData, setInnerData] = createSignal(props.value)
  // apply onChange callbacks
  createEffect(
    on(
      innerData,
      (currentInnerData) => {
        props.onChange?.(currentInnerData)
      },
      { defer: true },
    ),
  )

  return (
    <List
      shadowProps={shadowProps}
      icss={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
      }}
      items={innerData}
    >
      {(tag: string, idx) => (
        <Tag
          bg={props.bg ?? defaultTagBg}
          candidates={props.candidates ?? []}
          value={tag}
          defaultValue={tag}
          // icss={{ textTransform: "capitalize" }}
          onChange={({ itemValue }) => {
            setInnerData((prev) => prev.map((t, i) => (i === idx() ? itemValue() : t)))
          }}
        >
          {tag}
        </Tag>
      )}
    </List>
  )
}
