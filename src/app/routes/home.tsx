import { Box } from "@edsolater/pivkit"
import { Link } from "../components/Link"

export default function HomePage() {
  return (
    <Box>
      <Link href={"/playground"} innerRoute>
        Playground
      </Link>
    </Box>
  )
}
