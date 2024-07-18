import { Box } from "@edsolater/pivkit"
import { Link } from "./Link"

/**
 * have navbar(route bar) toggle button and wallet connect button
 */

export function RoutesButtons() {
  return (
    <Box
      icss={{
        display: "flex",
        gap: "16px",
      }}
    >
      <Link href="/swap" innerRoute>
        Swap
      </Link>
      <Link href="/pools" innerRoute>
        Pools
      </Link>
      <Link href="/farms" innerRoute>
        Farms
      </Link>
      <Link href="/playground" innerRoute>
        Playground
      </Link>
    </Box>
  )
}
