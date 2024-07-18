import { JSX, lazy } from "solid-js"

type RouteItem = {
  name: string
  path: string
  component: () => JSX.Element
  icon?: string

  /**
   * hiddenLink is only visible through type in url directly
   * @default false
   */
  isHiddenLink?: boolean

  needAppKeeper: boolean
}

function createRouteItem(options: RouteItem): RouteItem {
  return {
    name: options.name,
    path: options.path,
    component: options.component,
    icon: options.icon,
    isHiddenLink: options.isHiddenLink,
    needAppKeeper: options.needAppKeeper,
  }
}

export const routeItems = {
  home: createRouteItem({
    name: "Home",
    path: "/",
    component: lazy(() => import("./home")),
    needAppKeeper: true,
    isHiddenLink: true,
  }),
  playground: createRouteItem({
    name: "Playground",
    path: "/playground",
    component: lazy(() => import("./playground")),
    needAppKeeper: true,
  }),
  dailySchedule: createRouteItem({
    name: "Daily schedule",
    path: "/daily-schedule",
    component: lazy(() => import("../../schedulePicker/page")),
    needAppKeeper: true,
  }),
  vedioCollector: createRouteItem({
    name: "Vedio collector",
    path: "/vedio-collector",
    component: lazy(() => import("../../vedioCollector/page")),
    needAppKeeper: true,
  }),
}

export const routes = Object.values(routeItems)

export const isLocalhost = () => window.location.hostname === "localhost"
