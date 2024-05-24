import { Box, Piv } from "@edsolater/pivkit"
import { Link } from "../components/Link"
import { shuck_isTokenListLoading, shuck_tokens, store } from "../stores/data/store"
import { useWalletStore } from "../stores/wallet/store"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"
import { count } from "@edsolater/fnkit"

export default function HomePage() {
  const walletStore = useWalletStore()
  const tokens = useShuckValue(shuck_tokens)
  const isTokenListLoading = useShuckValue(shuck_isTokenListLoading)
  return (
    <div>
      <Box icss={{ margin: "8px" }}>
        {/* info */}
        <Piv>token count: {isTokenListLoading() ? "(loading)" : count(tokens())}</Piv>
        <Piv>current owner: {walletStore.owner}</Piv>
        <Piv>pair count: {store.isPairInfoLoading ? "(loading)" : count(store.pairInfos)}</Piv>
      </Box>
      <Link href={"/swap"} innerRoute>
        Swap
      </Link>

      {/* <LinkItem icon='/icons/entry-icon-pools.svg' href='/pools' isCurrentRoutePath={pageMatcher.isPairsPage}>
        Pools
      </LinkItem>
      <LinkItem icon='/icons/entry-icon-farms.svg' href='/farms' isCurrentRoutePath={pageMatcher.isFarmsPage}>
        Farms
      </LinkItem> */}
    </div>
  )
}
