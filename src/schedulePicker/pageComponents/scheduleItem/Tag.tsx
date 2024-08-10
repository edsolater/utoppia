import { type KitProps, Box, Icon, icssClickable, List, Loop, Piv, Text, useKitProps } from "@edsolater/pivkit"
import { createEffect, createSignal, on, type JSXElement } from "solid-js"
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
                  background: "white",
                  borderRadius: "50%",
                  padding: ".25rem",
                  scale: ".5",
                  transition: "all 300ms",
                },
                icssClickable(),
              ]}
              onClick={() => {
                setInnerData((prev) => prev.filter((_, i) => i !== idx()))
              }}
            >
              ❌
            </Piv>
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
          </Box>
        )}
      </Loop>

      <Icon
        icss={[icssClickable(), { color: colors.textTernary, alignSelf: "center", opacity: 0.5 }]}
        src="/icons/add.svg"
        onClick={() => {
          setInnerData((prev) => [...prev, ""])
        }}
      />
    </Box>
  )
}

/**
 * @example
 * <DecoratorWrapper>
 *
 *
 */
function DecoratorWrapper(
  kitProps: KitProps<{
    placement?: "top right" | "top left" | "bottom right" | "bottom left" | "center"
  }>,
) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "DecoratorWrapper" })
  return (
    <Box shadowProps={shadowProps} icss={{ position: "relative" }}>
      {props.children}
    </Box>
  )
}
