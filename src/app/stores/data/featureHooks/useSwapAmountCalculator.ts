import { notZero } from "@edsolater/fnkit"
import { createEffect } from "solid-js"
import { TokenAmount } from "../../../utils/dataStructures/TokenAmount"
import { createStorePropertySetter, createStorePropertySignal } from "../store"
import { getToken } from "../utils/getToken"
import { calculatedSwapRouteInfos_main } from "../portActions/calculateSwapRouteInfos_main"

/**
 * calculate swap amount from up to down
 */
export function useSwapAmountCalculator() {
  const token1 = createStorePropertySignal((s) => s.swapInputToken1)
  const token2 = createStorePropertySignal((s) => s.swapInputToken2)
  const amount1 = createStorePropertySignal((s) => s.swapInputTokenAmount1)
  const amount2 = createStorePropertySignal((s) => s.swapInputTokenAmount2)

  const setToken1 = createStorePropertySetter((s) => s.swapInputToken1)
  const setToken2 = createStorePropertySetter((s) => s.swapInputToken2)
  const setAmount1 = createStorePropertySetter((s) => s.swapInputTokenAmount1)
  const setAmount2 = createStorePropertySetter((s) => s.swapInputTokenAmount2)

  // // preflight
  // createEffect(() => {
  //   console.log('preflight')
  //   const inputToken = getToken(token1())
  //   const outputToken = getToken(token2())
  //   if (!inputToken) return
  //   if (!outputToken) return
  //   const inputAmount: TokenAmount = { token: inputToken, amount: 1 }

  //   const subscribable = calculatedSwapRouteInfos_main({
  //     input: inputToken,
  //     inputAmount,
  //     output: outputToken,
  //   })
  //   const s = subscribable.subscribe((info) => {
  //     if (!info) return
  //     const { bestResult } = info
  //   })
  // })

  // // swap calc
  // createEffect(() => {
  //   console.log('swap calc')
  //   const inputToken = getToken(token1())
  //   const outputToken = getToken(token2())
  //   const amount = amount1()

  //   if (!inputToken) return
  //   if (!outputToken) return
  //   if (!amount) return
  //   const inputAmount: TokenAmount = { token: inputToken, amount }
  //   const subscribable = calculatedSwapRouteInfos_main({
  //     input: inputToken,
  //     inputAmount,
  //     output: outputToken,
  //   })

  //   subscribable.subscribe((info) => {
  //     if (!info) return
  //     const { bestResult } = info
  //     const tokenAmount = bestResult?.amountOut.amount
  //     const n = tokenAmount
  //     if (notZero(n)) setAmount2(n)
  //   })
  // })
}
