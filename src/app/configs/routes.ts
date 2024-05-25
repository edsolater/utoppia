import { JSX } from "solid-js"
import HomePage from "../pages"
import PlaygroundPage from "../pages/playground"

type RouteItem = {
  name: string
  path: string
  component: () => JSX.Element
  icon?: string

  visiable: boolean
  needAppKeeper: boolean
}

function createRouteItem(options: RouteItem): RouteItem {
  return {
    name: options.name,
    path: options.path,
    component: options.component,
    icon: options.icon,
    visiable: options.visiable,
    needAppKeeper: options.needAppKeeper,
  }
}

export const poolsRoutePath = "/pools"
export const homeRoutePath = "/"
export const farmsRoutePath = "/farms"
export const playgroundRoutePath = "/playground"
export const swapRoutePath = "/swap"
export const clmmRoutePath = "/clmm"

export const homeRouteItem = createRouteItem({
  name: "home",
  path: homeRoutePath,
  component: HomePage,
  needAppKeeper: false,
  visiable: false,
})
export const playgroundRouteItem = createRouteItem({
  name: "playground",
  path: playgroundRoutePath,
  component: PlaygroundPage,
  visiable: true,
  needAppKeeper: true,
})
export const routes = [homeRouteItem, playgroundRouteItem]

export const isLocalhost = () => window.location.hostname === "localhost"
