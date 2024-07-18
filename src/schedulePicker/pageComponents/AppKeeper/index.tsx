import type { MayArray } from "@edsolater/fnkit"
import {
  Box,
  Fragnment,
  Image,
  Item,
  KitProps,
  Main,
  Section,
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
import { colors } from "../../../app/theme/colors"
import { Show } from "solid-js"

export type AppKeeperProps = {
  metaTitle?: string

  defineContentBanner?: PivChild
  TopbarBanner?: PivChild

  //#region ---------------- root ----------------
  bgImageSrc?: string
  //#endregion

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
        <Show when={props.bgImageSrc}>
          <Image
            src={props.bgImageSrc}
            icss={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: -1,
              objectFit: "cover",
              filter: "brightness(0.4) contrast(1) saturate(1.8) blur(2px) grayscale(0.5) opacity(0.8)",
              backgroundAttachment: "fixed",
            }}
          />
        </Show>

        <Section name={"top-banner"} icss={{ gridArea: "ban" }}>
          {props["TopbarBanner"]}
        </Section>

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

        <Section name={"content"} icss={[{ gridArea: "content" }, icssGrid]}>
          <Main
            icss={[
              icssCol,
              { position: "relative", overflow: "hidden" },
              {
                // background: cssLinearGradient({ colors: [colors.appMainContentBg__01, colors.appMainContentBg__02] }),
                borderTopLeftRadius: "20px",
              },
            ]}
          >
            <Fragnment>{props["defineContentBanner"]}</Fragnment>
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
        </Section>

        <Section
          name="FAB"
          icss={{ position: "absolute", right: "2vw", bottom: "2vh", display: "grid", gap: "4px", zIndex: 999 }}
        >
          {props["FABs"]}
        </Section>
      </Box>
    </AppKeeperContext.Provider>
  )
}
