import { assert, notZero, toStringNumber } from "@edsolater/fnkit"
import { createMemo } from "solid-js"
import {
  Button,
  Panel,
  Piv,
  Section,
  icssCard,
  icssCol,
  icssCyberpenkBackground,
  icssCyberpenkBackgroundGlow,
  icssCyberpenkBorder,
} from "@edsolater/pivkit"
import { TokenAmountInputBox } from "../components/TokenAmountInput"
import { useToken } from "../stores/data/token/useToken"
import { useSwapAmountCalculator as useSwapAmountCalculatorEffect } from "../stores/data/featureHooks/useSwapAmountCalculator"
import { launchTx } from "../utils/txHandler/txDispatcher_main"
import {
  createStorePropertySetter,
  createStorePropertySignal,
  setStore,
  shuck_owner,
  store,
} from "../stores/data/store"
import { Token } from "../stores/data/token/type"
import { useShuckValue } from "../../packages/conveyor/solidjsAdapter/useShuck"

export default function SwapPage() {
  const owner = useShuckValue(shuck_owner)
  const token1 = useToken(() => store.swapInputToken1) // it still can work, but why?
  const token2 = useToken(() => store.swapInputToken2) // it still can work, but why?
  const setToken1 = (token: Token | undefined) => {
    token && setStore({ swapInputToken1: token })
  }
  const setToken2 = (token: Token | undefined) => {
    token && setStore({ swapInputToken2: token })
  }

  const amount1 = createStorePropertySignal((s) => s.swapInputTokenAmount1)
  const amount2 = createStorePropertySignal((s) => s.swapInputTokenAmount2)
  const setAmount1 = createStorePropertySetter((s) => s.swapInputTokenAmount1)
  const setAmount2 = createStorePropertySetter((s) => s.swapInputTokenAmount2)
  const tokenAmount1 = createMemo(() =>
    amount1() ? toStringNumber(amount1(), { decimals: token1.decimals }) : undefined,
  )
  const tokenAmount2 = createMemo(() =>
    amount2() ? toStringNumber(amount2(), { decimals: token2.decimals }) : undefined,
  )

  useSwapAmountCalculatorEffect()

  return (
    <Piv>
      <Section icss={{ display: "grid", justifyContent: "center" }}>
        <Panel
          icss={[
            icssCard,
            icssCyberpenkBackground,
            icssCyberpenkBorder,
            icssCyberpenkBackgroundGlow,
            icssCol({ gap: ".5em" }),
          ]}
        >
          <TokenAmountInputBox
            token={token1}
            amount={tokenAmount1}
            onSelectToken={setToken1}
            onAmountChange={setAmount1}
          />
          <TokenAmountInputBox
            token={token2}
            amount={tokenAmount2}
            onSelectToken={setToken2}
            onAmountChange={setAmount2}
          />

          <Button
            onClick={() => {
              console.info("start swap")
              const coin1 = token1
              assert(coin1, "coin1 is undefined")
              const coin2 = token2
              assert(coin2, "coin2 is undefined")
              const amount1 = tokenAmount1()
              assert(notZero(amount1), "amount1 is undefined or zero")
              const walletOwner = owner()
              assert(walletOwner, "walletOwner is undefined")
              const rpcURL = store.rpc?.url
              assert(rpcURL, "should set url")

              launchTx({
                name: "swap",
                params: {
                  owner: walletOwner,
                  checkInfo: {
                    rpcURL,
                    coin1,
                    coin2,
                    amount1,
                    direction: "1 → 2",
                  },
                },
              })
            }}
          >
            Swap
          </Button>
        </Panel>
      </Section>
    </Piv>
  )
}
