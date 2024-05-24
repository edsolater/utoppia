import { toFixedDecimal, type MayArray } from "@edsolater/fnkit"
import {
  Box,
  KitProps,
  Piv,
  PivChild,
  createDisclosure,
  createDomRef,
  cssVar,
  resizablePlugin,
  useComponentContext,
  useKitProps,
  usePlugin,
  useShortcutsRegister,
  type KeybordShortcutKeys,
} from "@edsolater/pivkit"
import { createEffect, createSignal } from "solid-js"
import { useLocalStorageValue } from "../../../packages/cacheManager/hook"
import { colors } from "../../theme/colors"
import { documentElement } from "../../utils/documentElement"
import { AppKeeperContext } from "./AppKeeperContext"
import { usePanelFloatingMaster } from "./usePanelFloatingMaster"
import { useDocumentEdgeOpen } from "./useDocumentEdgeOpen"

export type AppKeeperPanelManagerProps = {
  panelName: string
  // can auto close floating panel when set this edge
  floatingEdge?: "top" | "right" | "bottom" | "left"
  canFloating?: boolean
  canFloatingAutoClose?: boolean // (default: `true`)
  defaultOpen?: boolean
  defaultFloating?: boolean
  canWidthResized: boolean
  initWidth?: number | string
  canHeightResized: boolean
  initHeight?: number
  toggleShortcut: MayArray<KeybordShortcutKeys>
  changeToFloatingShortcut: MayArray<KeybordShortcutKeys>
  children?: PivChild
}

export function AppKeeperPanelManager(kitprops: KitProps<AppKeeperPanelManagerProps>) {
  const { props, shadowProps } = useKitProps(kitprops)
  const panelName = props.panelName
  const [keeperContext, setKeeperContext] = useComponentContext(AppKeeperContext)
  const { dom: wrapperDOM, setDom } = createDomRef()
  const { dom: sizePlaceholderDOM, setDom: setSizePlaceholderDOM } = createDomRef()
  const [isPanelOpen, { toggle: togglePanel, open: openPanel, close: closePanel }] = createDisclosure(props.defaultOpen)
  const [isPanelFloating, { toggle: togglePanelFloating }] = createDisclosure(props.defaultFloating)
  // TODO
  // setKeeperContext({ isPanelOpen: { [panelName]: true }, isPanelFloating: { [panelName]: true } })
  useShortcutsRegister(documentElement, {
    [`toggle panel:${panelName}`]: {
      shortcut: props.toggleShortcut,
      action: togglePanel,
    },
    [`toggle floating mode of panel:${panelName}`]: {
      shortcut: props.changeToFloatingShortcut,
      action: togglePanelFloating,
    },
  })
  createEffect(() => {
    setTimeout(() => {
      console.log("isPanelFloating(), panelName: ", isPanelFloating(), panelName)
    })
  })
  if (props.floatingEdge) {
    usePanelFloatingMaster({
      el: wrapperDOM,
      floatingEdge: props.floatingEdge,
      enabled: isPanelFloating,
      onClose: closePanel,
      onOpen: openPanel,
    })
  }

  const [haveRenderContent, setHaveRenderContent] = createSignal(isPanelOpen()) // one-way of isPanelOpen
  createEffect(() => {
    if (isPanelOpen()) {
      setHaveRenderContent(true)
    }
  })
  const [panelWidth, setPanelWidth] = useLocalStorageValue(`__AppKeeper_${panelName}-x`, String(props.initWidth ?? 0))
  const [panelHeight, setPanelHeight] = useLocalStorageValue(
    `__AppKeeper_${panelName}-y`,
    String(props.initHeight ?? 0),
  )

  const [resizablePluginModule, { resizingHiddenTransactionMask }] = usePlugin(resizablePlugin, {
    onSizeChange({ currentVal, dir }) {
      if (dir === "x") setPanelWidth(currentVal.toFixed(3))
      if (dir === "y") setPanelHeight(currentVal.toFixed(3))
    },
    onResizing({ currentVal, dir }) {
      if (dir === "x") wrapperDOM()?.style.setProperty(`--${panelName}-x`, `${toFixedDecimal(currentVal, 3)}px`)
      if (dir === "y") wrapperDOM()?.style.setProperty(`--${panelName}-y`, `${toFixedDecimal(currentVal, 3)}px`)
    },
    canResizeX: props.canWidthResized,
    canResizeY: props.canHeightResized,
  })
  return (
    <Piv // subcomponent area grid-item
      class={`panel-${panelName}`}
      domRef={[setDom, resizingHiddenTransactionMask]}
      shadowProps={shadowProps}
      icss={{
        // width: cssVar("--side-menu-width"),
        width: props.canWidthResized
          ? isPanelOpen() && !isPanelFloating()
            ? cssVar(`--${panelName}-x`)
            : "0vw"
          : "unset",
        height: props.canHeightResized
          ? isPanelOpen() && !isPanelFloating()
            ? cssVar(`--${panelName}-y`)
            : "0vh"
          : "unset",
        transition: "500ms",
      }}
      // render:self={renderAsHTMLAside}
      style={{
        [`--${panelName}-x`]: props.canWidthResized
          ? panelWidth()
            ? `${toFixedDecimal(panelWidth()!, 3)}px`
            : "auto"
          : undefined,
        [`--${panelName}-y`]: props.canHeightResized
          ? panelHeight()
            ? `${toFixedDecimal(panelHeight()!, 3)}px`
            : "auto"
          : undefined,
      }}
    >
      <Box // size & position placeholder (always static, so it can hold size info)
        class="panel-placeholder"
        domRef={[setSizePlaceholderDOM, resizingHiddenTransactionMask]}
        icss={{
          width: props.canWidthResized ? cssVar(`--${panelName}-x`) : "100%",
          height: props.canHeightResized ? cssVar(`--${panelName}-y`) : "100%",
          position: "relative",
          transform: props.canWidthResized
            ? isPanelOpen()
              ? "translateX(0)"
              : "translateX(-100%)"
            : props.canHeightResized
              ? isPanelOpen()
                ? "translateY(0)"
                : "translateY(-100%)"
              : "unset",
          transition: "500ms",
          zIndex: 999,
        }}
        plugin={resizablePluginModule}
      >
        <Box // content holder (always absolute, so it has no size info)
          icss={[
            {
              background: colors.appPanelBg,
              position: "absolute",
              display: "grid",
              containerType: "size",
              transition: "200ms",
              overflow: "hidden",
            },
            isPanelFloating()
              ? {
                  top: ".5em",
                  left: ".5em",
                  height: "calc(100% - 1em)",
                  width: "calc(100% - 1em)",
                  borderRadius: "16px",
                  boxShadow: "0 0 16px rgba(0,0,0,0.1)",
                }
              : { left: "0", top: "0", width: "100%", height: "100%" },
          ]}
        >
          {haveRenderContent() ? props.children : null}
        </Box>
      </Box>
    </Piv>
  )
}
