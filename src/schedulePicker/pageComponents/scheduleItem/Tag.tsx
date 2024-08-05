import { type KitProps, icssClickable, Text, useKitProps } from "@edsolater/pivkit"
import { colors } from "../../../app/theme/colors"
import { popupWidget } from "./popupWidget"
import { type SelectPanelProps, SelectPanel } from "./Select"

/**
 * TODO: should normalized and move to pivkit
 * - temporary just simple  mode, feature:multiple mode is ongoing
 *
 */
export function Tag(
  kitProps: KitProps<{
    bg?: string
    candidates: string[]
    defaultValue?: string
    value?: string
    onChange?: SelectPanelProps<string>["onChange"]
  }>,
) {
  const { props } = useKitProps(kitProps, { name: "Tag" })
  const defaultTagBg = "#888"
  return (
    <Text
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
            onChange={props.onChange}
          />
        ),
      })}
    >
      {props.value ?? " "}
    </Text>
  )
}
