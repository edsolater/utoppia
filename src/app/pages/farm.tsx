import { add, find, toStringNumber } from "@edsolater/fnkit"
import { Box, CollapseBox, CollapseFace, InfiniteScrollList, Piv, createCachedGlobalHook } from "@edsolater/pivkit"
import { For, Setter, Show, createMemo, createSignal } from "solid-js"
import { TokenAvatar } from "../components/TokenAvatar"
import { TokenAvatarPair } from "../components/TokenAvatarPair"
import { store } from "../stores/data/store"
import { FarmJSON } from "../stores/data/types/farm"
import { getToken } from "../stores/data/utils/getToken"

export interface FarmPageStates {
  // setters
  setDetailViewFarmId: Setter<string | undefined>

  readonly detailViewFarmId: string | undefined
  readonly detailViewFarmJsonInfo: FarmJSON | undefined
}

export const useFarmPageStates = createCachedGlobalHook(() => {
  const farmJsonInfos = store.farmJsonInfos
  const [detailViewFarmId, setDetailViewFarmId] = createSignal<string>()
  const detailViewFarmJsonInfo = createMemo(() => find(farmJsonInfos, (info) => info.id === detailViewFarmId()))
  const states: FarmPageStates = {
    // setters
    setDetailViewFarmId,
    get detailViewFarmId() {
      return detailViewFarmId()
    },
    get detailViewFarmJsonInfo() {
      return detailViewFarmJsonInfo()
    },
  }
  return states
})

const icssSmoothBoxShadow =
  "0 1px 1px rgb(16 27 30 / 8%), 0 2px 2px rgb(16 27 30 / 8%), 0 4px 4px rgb(16 27 30 / 8%), 0 8px 8px rgb(16 27 30 / 8%), 0 16px 16px rgb(16 27 30 / 8%)"

export default function FarmPage() {
  return (
    <Piv>
      <FarmList />
    </Piv>
  )
}

function FarmList() {
  const farmPageStates = useFarmPageStates()
  const farmInfos = store.farmInfos

  return (
    <InfiniteScrollList items={farmInfos}>
      {(info, farmId, idx) => (
        <CollapseBox icss={{ background: idx() % 2 ? "#eeee" : "transparent" }}>
          <CollapseFace>
            {(controller) => (
              <Box
                icss={{
                  display: "grid",
                  gridTemplateColumns: ".3fr 1fr 1fr 1fr 1fr",
                  padding: "6px",
                  borderRadius: "4px",
                }}
                onClick={() => {
                  farmPageStates.setDetailViewFarmId(info.id)
                }}
              >
                {/* part 1 */}
                <Box></Box>

                {/* part 2 */}
                <Box
                  icss={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <TokenAvatarPair token1={getToken(info.base)} token2={getToken(info.quote)} />
                  {/* <Piv>{info.name}</Piv> */}
                </Box>

                {/* part 3 : pending reward*/}
                <Piv>
                  <For each={info.rewards}>{(r) => <TokenAvatar token={getToken(r.token)} />}</For>
                </Piv>

                {/* part 4 total apr */}
                <Piv>
                  {toStringNumber(
                    info.rewards.map((r) => r.apr?.["24h"]).reduce((acc, r) => (r ? add(acc ?? 0, r) : acc), 0),
                  )}
                </Piv>

                {/* part 5 tvl */}
                <Piv>{toStringNumber(info.tvl)}</Piv>

                {/* <Show when={controller.isOpen}>
                    <Piv>{info.version}</Piv>
                  </Show> */}
              </Box>
            )}
          </CollapseFace>
          <CollapseBox.Content>
            <Piv>
              <Piv>state: {info.hasLoad.join(" ")}</Piv>
              <Show when={info.userStakedLpAmount}>
                <Piv>deposited: {toStringNumber(info.userStakedLpAmount?.amount)}</Piv>
                <Piv>to havest: {toStringNumber(info.userStakedLpAmount?.amount)}</Piv>
              </Show>
            </Piv>
          </CollapseBox.Content>
        </CollapseBox>
      )}
    </InfiniteScrollList>
  )
}
