import { createComponentContext } from "@edsolater/pivkit"
import { type Accessor } from "solid-js"
import type { AppKeeperProps } from "."

export const AppKeeperContext = createComponentContext<
  {
    isSideMenuOpen?: Accessor<boolean>
    isSideMenuFloating?: Accessor<boolean>
    toggleSideMenu?: () => void

    isTopBarOpen?: Accessor<boolean>
    isTopBarFloating?: Accessor<boolean>
    toggleTopBar?: () => void
  } & AppKeeperProps
>()
