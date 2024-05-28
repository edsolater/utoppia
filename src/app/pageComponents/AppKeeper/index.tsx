import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  Fragnment,
  Item,
  KitProps,
  Main,
  cssLinearGradient,
  cssVar,
  icssCol,
  icssGrid,
  useKitProps,
  type KeybordShortcutKeys,
  type PivChild,
} from "@edsolater/pivkit"
import { useMetaTitle } from "../../hooks/useDocumentMetaTitle"
import { AppKeeperContext } from "./AppKeeperContext"
import { AppKeeperPanelManager } from "./AppKeeperPanelManager"

export type AppKeeperProps = {
  metaTitle?: string

  "render:contentBanner"?: PivChild
  TopbarBanner?: PivChild

  // ---------------- topbar ----------------
  Topbar?: PivChild
  topbarShortcut?: MayArray<KeybordShortcutKeys>
  topbarCanFloating?: boolean
  topbarFloatingShortcut?: MayArray<KeybordShortcutKeys>

  // ---------------- sidebar ----------------
  Sidebar?: PivChild
  sidebarShortcut?: MayArray<KeybordShortcutKeys>
  sidebarCanFloating?: boolean
  sidebarFloatingShortcut?: MayArray<KeybordShortcutKeys>

  // ---------------- content ----------------
  Content?: PivChild

  // ---------------- floating panels ----------------
  FABs?: PivChild
}

export function AppKeeper(kitProps: KitProps<AppKeeperProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  useMetaTitle(props.metaTitle)
  // const isSideMenuOpen = createIntervalSignal({ intervalDelay: 3000, default: true, run: false })
  return (
    <AppKeeperContext.Provider value={{ props }}>
      <Box
        shadowProps={shadowProps}
        icss={{
          position: "relative",
          width: "100%",
          height: "100%",
          padding:
            "env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)",
          display: "grid",
          gridTemplate: `
          "ban  ban    " auto
          "top  top    " auto
          "side content" 1fr / auto 1fr`,
          overflow: "hidden",
          willChange: "opacity",
        }}
      >
        <Item name={"top-banner"} icss={{ gridArea: "ban" }}>
          {props["TopbarBanner"]}
        </Item>

        <AppKeeperPanelManager
          panelName="top-bar"
          floatingEdge={"top"}
          icss={{ gridArea: "top" }}
          toggleShortcut={props.topbarShortcut ?? "alt + '"}
          canFloating={props.topbarCanFloating}
          changeToFloatingShortcut={props.topbarFloatingShortcut ?? "shift + alt + '"}
          defaultOpen
          canHeightResized
          initHeight={80}
          canWidthResized={false}
        >
          {props["Topbar"]}
        </AppKeeperPanelManager>

        <AppKeeperPanelManager
          panelName="side-menu"
          floatingEdge={"left"}
          icss={{ gridArea: "side" }}
          toggleShortcut={props.sidebarShortcut ?? "alt + \\"}
          canFloating={props.sidebarCanFloating}
          changeToFloatingShortcut={props.sidebarFloatingShortcut ?? "shift + alt + \\"}
          defaultFloating
          canWidthResized
          initWidth={300}
          canHeightResized={false}
        >
          {props["Sidebar"]}
        </AppKeeperPanelManager>

        <Item name={"content"} icss={[{ gridArea: "content" }, icssGrid]}>
          <Main
            icss={[
              icssCol,
              { position: "relative", overflow: "hidden" },
              {
                background: cssLinearGradient({ colors: [cssVar("--content-bg__01"), cssVar("--content-bg__02")] }),
                borderTopLeftRadius: "20px",
              },
            ]}
          >
            <Fragnment>{props["render:contentBanner"]}</Fragnment>
            <Box
              icss={[
                icssCol({ childItems: "none" }),
                {
                  flexGrow: 1,
                  height: 0,
                  isolation: "isolate",
                  padding: "24px",
                  display: "grid",
                  gridAutoFlow: "column",
                  overflowY: "scroll",
                  overflowX: "hidden",
                },
              ]}
            >
              {props.children}
            </Box>
          </Main>
        </Item>

        <Box icss={{ position: "absolute", right: "2vw", bottom: "2vh", display: "grid", gap: "4px" }}>
          {props["FABs"]}
        </Box>
      </Box>
    </AppKeeperContext.Provider>
  )
}
