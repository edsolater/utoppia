import { capitalize, switchCase } from "@edsolater/fnkit"
import { configUIKitTheme } from "@edsolater/pivkit"
import { RouteSectionProps } from "@solidjs/router"
import { Show, createMemo } from "solid-js"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckvisibleChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { uikitConfig } from "../../schedulePicker/configs/uikitTheme"
import { initAppContextConfig } from "../../schedulePicker/hooks/initAppContextConfig"
import { AppKeeper } from "./AppKeeper"
import { KeyboardShortcutPanel } from "./KeyboardShortcutPanel"
import { ShuckInspectorPanel } from "./ShuckInspectorPanel"
import { SideMenu } from "./SideMenu"
import { routes } from "../routes/routes"
import { NavBar } from "./AppNavBar"

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
  const { src: bgImageSrc } = useAppImage()
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

function useAppImage() {
  // https://bing.img.run/api.html
  const src = "https://bing.img.run/uhd.php"

  // const src = "https://i.pximg.net/img-original/img/2023/04/06/02/02/07/106906266_p2.png"
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
  setShuckvisibleChecker(testCount, true, undefined)
  testCount.set((n) => n + 1)
  setTimeout(() => {
    console.log("effectRunCount: ", effectRunCount)
  })
}
