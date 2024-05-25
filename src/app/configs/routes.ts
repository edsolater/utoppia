import { JSX } from "solid-js"
import HomePage from "../pages"
import PlaygroundPage from "../pages/playground"
import DailySchedulePage from "../pages/daily-schedule"

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
    component: HomePage,
    needAppKeeper: false,
    isHiddenLink: true,
  }),
  playground: createRouteItem({
    name: "playground",
    path: "/playground",
    component: PlaygroundPage,
    needAppKeeper: true,
  }),
  dailySchedule: createRouteItem({
    name: "daily schedule",
    path: "/daily-schedule",
    component: DailySchedulePage,
    needAppKeeper: true,
  }),
}

export const routes = Object.values(routeItems)

export const isLocalhost = () => window.location.hostname === "localhost"
