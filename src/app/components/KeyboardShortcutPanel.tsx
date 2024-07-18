import { map } from "@edsolater/fnkit"
import {
  Box,
  Icon,
  InfiniteScrollList,
  Input,
  KeybordShortcutKeys,
  Piv,
  Text,
  cssColors,
  keyboardShortcutObserverPlugin,
  useShortcutsInfo,
  useShortcutsRegister
} from "@edsolater/pivkit"
import { useNavigate } from "@solidjs/router"
import { globalRouteShortcuts } from "../../schedulePicker/configs/globalShortcuts"
import { colors } from "../theme/colors"
import { documentElement } from "../../schedulePicker/utils/documentElement"
import { FABPanel } from "./FABPanel"

/**
 *
 * COMPONENT
 * show current page valiable shortcut
 */

export function KeyboardShortcutPanel() {
  const navigate = useNavigate()
  const { shortcuts } = useShortcutsInfo(documentElement)
  const { updateShortcut } = useShortcutsRegister(
    documentElement,
    map(globalRouteShortcuts, ({ to, shortcut }) => ({
      shortcut,
      action: () => navigate(to),
    })),
  )

  // utils for update shortcut
  const updateSetting = (description: string, shortcut: KeybordShortcutKeys) => {
    updateShortcut(description, { shortcut })
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
          <Icon src={"/icons/keyboard.svg"}></Icon>
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
            width: "400px",
            height: "400px",
          }}
        >
          <InfiniteScrollList items={shortcuts()}>
            {({ description, shortcut }) => (
              <Box icss={{ display: "grid", gridTemplateColumns: "180px 200px", gap: "8px" }}>
                <Text icss={cssColors.labelColor}>{description}</Text>
                <Input
                  value={String(shortcut)}
                  plugin={keyboardShortcutObserverPlugin({
                    onRecordShortcut({ shortcut: newShortcut, el }) {
                      if (newShortcut !== shortcut) {
                        updateSetting(description, newShortcut)
                      }
                    },
                  })}
                />
              </Box>
            )}
          </InfiniteScrollList>
        </Box>
      }
    ></FABPanel>
  )
}
