import { JSX, lazy } from "solid-js"

type RouteItem = {
  name: string
  path: string
  component: () => JSX.Element
  icon?: string

  /**
   * hiddenLink is only visiable through type in url directly
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
    name: "home",
    path: "/",
    component: lazy(() => import("./app")),
    needAppKeeper: true,
    isHiddenLink: true,
  }),
  playground: createRouteItem({
    name: "playground",
    path: "/playground",
    component: lazy(() => import("./playground")),
    needAppKeeper: true,
  }),
  dailySchedule: createRouteItem({
    name: "daily schedule",
    path: "/daily-schedule",
    component: lazy(() => import("./daily-schedule")),
    needAppKeeper: true,
  }),
}

export const routes = Object.values(routeItems)

export const isLocalhost = () => window.location.hostname === "localhost"
