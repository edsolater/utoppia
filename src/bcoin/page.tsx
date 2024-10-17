import { Box } from "@edsolater/pivkit"

// doc: https://station.jup.ag/docs/apis/swap-api
/**
 * Renders the BCoin component.
 */
export default function BCoinPage() {
  const res = fetch(
    "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50",
  )

  res
    .then((r) => r.json())
    .then((response) => {
      console.log("response: ", response)
    })

  return <Box>Hello this is page:bcoin</Box>
}
