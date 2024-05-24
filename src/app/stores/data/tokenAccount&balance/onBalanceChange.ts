import { applyDecimal, setItem, type Numberish, type Subscription } from "@edsolater/fnkit"
import type { Mint } from "../../../utils/dataStructures/type"
import { shuck_balances } from "../store"
import { getCurrentToken } from "../token/getCurrentToken"
import type { Token } from "../token/type"

type BalanceChangeCallback = (utils: {
  balanceBN: Numberish | undefined
  balance: Numberish | undefined
  prevBalance: Numberish | undefined
  prevBalanceBN: Numberish | undefined
  token: Token | undefined
  unsubscribe: () => void
}) => void
const onBalanceChangeCallbacks = new Map<Mint, BalanceChangeCallback[]>()
/**
 * in main thread
 */
export function onBalanceChange(mint: Mint, onChange: BalanceChangeCallback): Subscription {
  setItem(onBalanceChangeCallbacks, mint, (callbacks) => (callbacks ? [...callbacks, onChange] : [onChange]))
  const unsubscribe = () => {
    setItem(onBalanceChangeCallbacks, mint, (callbacks) => callbacks?.filter((cb) => cb !== onChange))
  }
  shuck_balances.subscribe(
    (balancesBNs, prevBalancesBNs) => {
      for (const [mint, callbacks] of onBalanceChangeCallbacks) {
        const token = getCurrentToken(mint)
        const balanceBN = balancesBNs[mint]
        const prevBalanceBN = prevBalancesBNs?.[mint]
        if (balanceBN !== prevBalanceBN) {
          callbacks.forEach((cb) =>
            cb({
              balanceBN,
              prevBalanceBN,
              balance: token && balanceBN != null ? applyDecimal(balanceBN, token.decimals) : undefined,
              prevBalance: token && prevBalanceBN != null ? applyDecimal(prevBalanceBN, token.decimals) : undefined,
              token,
              unsubscribe,
            }),
          )
        }
      }
    },
    { key: "to onBalanceChange" },
  )
  return { unsubscribe }
}
