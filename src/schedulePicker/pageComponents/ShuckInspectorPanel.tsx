import { isObject, isUndefined } from "@edsolater/fnkit"
import { Box, Icon, InfiniteScrollList, Piv, Text, cssColors } from "@edsolater/pivkit"
import { shuck_isMobile } from "../stores/data/store"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"
import { FABPanel, FABPanelProps } from "./FABPanel"
import { colors } from "../../app/theme/colors"

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */
export function ShuckInspectorPanel() {
  const isMobile = useShuckValue(shuck_isMobile)

  const allShucks = {
    isMobile,
  }
  return (
    <FABPanel
      thumbnailIcon={
        <Piv // thumbnail
          icss={{
            borderRadius: "50%",
            width: "1.5em",
            height: "1.5em",
            background: colors.buttonPrimary,
            color: "white",
            display: "grid",
            placeContent: "center",
            fontSize: "2em",
          }}
        >
          <Icon src={"/icons/info.svg"}></Icon>
        </Piv>
      }
      panelIcss={{
        color: colors.textPrimary,
        position: "fixed",
        borderRadius: "16px",
        top: "40%",
        left: "40%",
      }}
      content={
        <Box
          class={"keyboard-shortcut-panel"}
          icss={{
            //TODO: should be on by keyboard , temporary just hidden it!!
            padding: "4px",
            zIndex: 10,
            contain: "content",
          }}
        >
          <InfiniteScrollList items={allShucks}>
            {(value, name) => (
              <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
                <Text icss={cssColors.labelColor}>{name}</Text>
                <Text>
                  {isObject(value()) ? Object.keys(value()!).length : isUndefined(value()) ? null : String(value())}
                </Text>
              </Box>
            )}
          </InfiniteScrollList>
        </Box>
      }
    ></FABPanel>
  )
}
