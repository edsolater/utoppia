import { capitalize, switchCase } from "@edsolater/fnkit"
import { configUIKitTheme } from "@edsolater/pivkit"
import { RouteSectionProps } from "@solidjs/router"
import { Show, createMemo } from "solid-js"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { uikitConfig } from "../configs/uikitTheme"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppKeeper } from "../pageComponents/AppKeeper"
import { KeyboardShortcutPanel } from "../pageComponents/KeyboardShortcutPanel"
import { NavBar } from "../pageComponents/NavBar"
import { ShuckInspectorPanel } from "../pageComponents/ShuckInspectorPanel"
import { SideMenu } from "../pageComponents/SideMenu"
import { routes } from "../routes/routes"

// config uikit theme before render
initAppContextConfig({ themeMode: "dark", onlyAltSelect: true })
configUIKitTheme(uikitConfig)

export function AppRootLayout(props: RouteSectionProps) {
  const location = props.location
  const title = createMemo(() =>
    switchCase(location.pathname, { "/": "Home" }, (pathname) => pathname.split("/").map(capitalize).join(" ")),
  )
  const needLayout = createMemo(() => routes.find(({ path }) => path === location.pathname)?.needAppKeeper)
  useExperimentalCode()
  const { src: bgImageSrc } = useBingDailyImage()
  // useLocalStorageRpc()
  return (
    <Show when={needLayout()} fallback={props.children}>
      <AppKeeper
        metaTitle={title()}
        Topbar={<NavBar />}
        Sidebar={<SideMenu />}
        FABs={[<KeyboardShortcutPanel />, <ShuckInspectorPanel />]} // FIXME: cause performance issue
        bgImageSrc={bgImageSrc}
      >
        {props.children}
      </AppKeeper>
    </Show>
  )
}

function useBingDailyImage() {
  // https://bing.img.run/api.html
  const src = "https://bing.img.run/rand.php"
  return { src }
}

/** code for test */
function useExperimentalCode() {
  let effectRunCount = 0
  const { branchStore } = createBranchStore({ testCount: 1 })
  const testCount = branchStore.testCount()
  const effect = createTask([testCount], () => {
    effectRunCount++
  })
  effect.run()
  testCount.set((n) => n + 1)
  setShuckVisiableChecker(testCount, true, undefined)
  testCount.set((n) => n + 1)
  setTimeout(() => {
    console.log("effectRunCount: ", effectRunCount)
  })
}
