import { Col, Grid, KitProps, useComponentContext, useKitProps } from "@edsolater/pivkit"
import { NavRouteItems } from "./NavigationItems"
import { createEffect } from "solid-js"
import { AppKeeperContext } from "../AppKeeper/AppKeeperContext"
import { OptionAdditionalItems } from "./OptionAdditionalItems"

/**
 * for easier to code and read
 */
export type SideMenuProps = {}

export function SideMenu(kitProps: KitProps<SideMenuProps>) {
  const { props, shadowProps } = useKitProps(kitProps)
  const [appLayoutContext, setAppLayoutContext] = useComponentContext(AppKeeperContext)
  createEffect(() => {})
  console.log("render side menu")
  return (
    <Col
      shadowProps={shadowProps}
      icss={{
        height: "100cqb",
        width: "100cqi",
        overflowY: "auto",
      }}
    >
      <Grid
        icss={{
          gridTemplateRows: "2fr 1fr auto",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <NavRouteItems />

        <OptionAdditionalItems />

        {/* <Tooltip>
            <div className='text-sm mobile:text-xs m-2 mb-0 leading-relaxed opacity-50 hover:opacity-100 transition font-medium text-[#abc4ff] whitespace-nowrap cursor-default'>
              <div>V {currentVersion.slice(1)}</div>
              <div>
                <BlockTimeClock />
              </div>
            </div>
            <Tooltip.Panel>
              <div className='text-xs m-2 leading-relaxed font-medium text-[#abc4ff] whitespace-nowrap cursor-default'>
                <div>Current: {currentVersion}</div>
                <div>Latest: {latestVersion}</div>
                <div>Block time: {<BlockTimeClock showSeconds />}</div>
              </div>
            </Tooltip.Panel>
          </Tooltip> */}
      </Grid>
    </Col>
  )
}
