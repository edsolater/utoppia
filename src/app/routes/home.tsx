import { Box, Loop } from "@edsolater/pivkit"
import { Show } from "solid-js"
import { Link } from "../components/Link"
import { routes } from "./routes"

export default function HomePage() {
  return (
    <Box>
      <Loop items={routes}>
        {(route) => (
          <Show when={!route.isHiddenLink}>
            <Link icss={{ display: "block" }} href={route.path} innerRoute>
              {route.name}
            </Link>
          </Show>
        )}
      </Loop>
    </Box>
  )
}
