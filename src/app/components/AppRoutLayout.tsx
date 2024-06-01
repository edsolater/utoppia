import { capitalize, switchCase } from "@edsolater/fnkit"
import { configUIKitTheme } from "@edsolater/pivkit"
import { RouteSectionProps } from "@solidjs/router"
import { Show, createEffect, createMemo, onCleanup, onMount } from "solid-js"
import { useStorageValue } from "../../packages/cacheManager/hook"
import { createBranchStore } from "../../packages/conveyor/smartStore/branch"
import { setShuckVisiableChecker } from "../../packages/conveyor/smartStore/shuck"
import { createTask } from "../../packages/conveyor/smartStore/task"
import { routes } from "../routes/routes"
import { uikitConfig } from "../configs/uikitTheme"
import { initAppContextConfig } from "../hooks/initAppContextConfig"
import { AppKeeper } from "../pageComponents/AppKeeper"
import { KeyboardShortcutPanel } from "../pageComponents/KeyboardShortcutPanel"
import { NavBar } from "../pageComponents/NavBar"
import { ShuckInspectorPanel } from "../pageComponents/ShuckInspectorPanel"
import { SideMenu } from "../pageComponents/SideMenu"

// config uikit theme before render
initAppContextConfig({ themeMode: "dark", onlyAltSelect: true })
configUIKitTheme(uikitConfig)

export function AppRoutLayout(props: RouteSectionProps) {
  const location = props.location
  const title = createMemo(() =>
    switchCase(location.pathname, { "/": "Home" }, (pathname) => pathname.split("/").map(capitalize).join(" ")),
  )
  const needLayout = createMemo(() => routes.find(({ path }) => path === location.pathname)?.needAppKeeper)
  useExperimentalCode()
  // useLocalStorageRpc()
  return (
    <Show when={needLayout()} fallback={props.children}>
      <AppKeeper
        metaTitle={title()}
        Topbar={<NavBar />}
        Sidebar={<SideMenu />}
        FABs={[<KeyboardShortcutPanel />, <ShuckInspectorPanel />]} // FIXME: cause performance issue
      >
        {props.children}
      </AppKeeper>
    </Show>
  )
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
