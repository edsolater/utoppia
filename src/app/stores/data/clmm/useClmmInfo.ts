import { add, assert, eq, get, greaterThan, gt, isExist, isPositive, lt, minus, type Numberish } from "@edsolater/fnkit"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import type { TxBuilderSingleConfig } from "../../../utils/txHandler/txDispatcher_main"
import { mergeTwoStore } from "../featureHooks/mergeTwoStore"
import {
  shuck_balances,
  shuck_owner,
  shuck_rpc,
  shuck_slippage,
  shuck_tokenPrices,
  shuck_tokens,
  type Prices,
} from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  calcPositionUserPositionLiquidityUSD,
  getClmmUserPositionAccountAdditionalInfo,
  type AdditionalClmmUserPositionAccount,
} from "./getClmmUserPositionAccountAdditionalInfo"
import type { Tokens } from "../token/type"
import { createEffect } from "solid-js"

type FollowPositionTxConfigs = {
  // upTokenMint: Mint | undefined
  // downTokenMint: Mint | undefined
  upDecreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
  downDecreaseClmmPositionTxConfigs: TxBuilderSingleConfig[]
  upShowHandTxConfigs: TxBuilderSingleConfig[]
  downShowHandTxConfigs: TxBuilderSingleConfig[]
}

type AdditionalClmmInfo = {
  totalLiquidityUSD: Numberish | undefined
  buildTxFollowPositionTxConfigs(options?: { ignoreWhenUsdLessThan?: number }): FollowPositionTxConfigs
}

export function useClmmInfo(clmmInfo: ClmmInfo): AdditionalClmmInfo & ClmmInfo {
  const pricesMap = useShuckValue(shuck_tokenPrices)
  const tokens = useShuckValue(shuck_tokens) // TODO let still invisiable unless actual use this value
  const rpc = useShuckValue(shuck_rpc)
  const owner = useShuckValue(shuck_owner)
  const slippage = useShuckValue(shuck_slippage)
  const balances = useShuckValue(shuck_balances)
  const tokenA = useToken(() => clmmInfo.base)
  const tokenB = useToken(() => clmmInfo.quote)
  const priceA = useTokenPrice(() => clmmInfo.base)
  const priceB = useTokenPrice(() => clmmInfo.quote)


  function getPositionInfo(position: ClmmUserPositionAccount) {
    return getClmmUserPositionAccountAdditionalInfo({
      clmmInfo: () => clmmInfo,
      positionInfo: () => position,
      pricesMap,
      tokens,
      rpcUrl: () => rpc()?.url,
      owner,
      slippage,
      balances,
      tokenA: () => tokenA,
      tokenB: () => tokenB,
      priceA,
      priceB,
    })
  }

  const additional = {
    buildTxFollowPositionTxConfigs: (options) =>
      buildTxFollowPositionConfigs({
        clmmInfo,
        getPositionInfo,
        config: {
          ignoredPositionUsd: options?.ignoreWhenUsdLessThan ?? 5,
        },
      }),
    totalLiquidityUSD: calcTotalClmmLiquidityUSD({ clmmInfo, tokens: tokens(), prices: pricesMap() })
      ?.totalLiquidityUSD,
  } as AdditionalClmmInfo
  return mergeTwoStore(clmmInfo, additional)
}

// TODO: convenient to  sign at once,but sign in different time
function buildTxFollowPositionConfigs({
  clmmInfo,
  getPositionInfo,
  config,
}: {
  clmmInfo: ClmmInfo
  getPositionInfo(position: ClmmUserPositionAccount): AdditionalClmmUserPositionAccount
  config: {
    ignoredPositionUsd: number
  }
}): FollowPositionTxConfigs {
  const positions = clmmInfo.userPositionAccounts
  assert(positions && positions.length > 0, "no position to follow; the button shouldn't be clickable")
  const currentPrice = clmmInfo.currentPrice
  assert(isExist(currentPrice), "current price is not available")

  // ---------------- group position ----------------
  const currentPositions = [] as ClmmUserPositionAccount[]
  const upPositions = [] as ClmmUserPositionAccount[] // out of range
  const downPositions = [] as ClmmUserPositionAccount[] // out of range

  const sortedPositions = positions?.toSorted((a, b) =>
    greaterThan(a.priceLower, b.priceLower) ? -1 : eq(a.priceLower, b.priceLower) ? 0 : 1,
  ) // original is already sorted, use this only for ensure the order
  for (const position of sortedPositions) {
    const priceLower = position.priceLower
    const priceUpper = position.priceUpper

    const isUpperLessThanCurrentPrice = lt(priceUpper, currentPrice)
    const isLowerGreaterThanCurrentPrice = gt(priceLower, currentPrice)
    const isUpperGreaterThanCurrentPrice = !isUpperLessThanCurrentPrice
    const isLowerLessThanCurrentPrice = !isLowerGreaterThanCurrentPrice
    if (isUpperGreaterThanCurrentPrice && isLowerLessThanCurrentPrice) {
      currentPositions.push(position)
    }
    if (isLowerGreaterThanCurrentPrice) {
      upPositions.push(position)
    }
    if (isUpperLessThanCurrentPrice) {
      downPositions.push(position)
    }
  }

  const upDecreaseClmmPositionTxConfigs = [] as TxBuilderSingleConfig[]
  const downDecreaseClmmPositionTxConfigs = [] as TxBuilderSingleConfig[]
  const upShowHandTxConfigs = [] as TxBuilderSingleConfig[]
  const downShowHandTxConfigs = [] as TxBuilderSingleConfig[]

  // ---------------- handle up positions ----------------
  if (upPositions.length > 1) {
    let nearestUpPosition = upPositions[0]
    for (const position of upPositions) {
      if (lt(position.priceLower, nearestUpPosition.priceLower)) {
        nearestUpPosition = position
      }
    }

    for (const position of upPositions.filter((p) => p !== nearestUpPosition)) {
      const richPosition = getPositionInfo(position)
      const originalUSD = richPosition.userLiquidityUSD()
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, config.ignoredPositionUsd * 1.2))
      if (needMove) {
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: config.ignoredPositionUsd })
        if (txBuilderConfig) {
          upDecreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    // show hand
    const richPosition = getPositionInfo(nearestUpPosition)
    const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
    if (txBuilderConfig) {
      upShowHandTxConfigs.push(txBuilderConfig)
    }
  }

  // ---------------- handle down positions ----------------
  if (downPositions.length > 1) {
    let nearestDownPosition = downPositions[0]
    for (const position of downPositions) {
      if (gt(position.priceUpper, nearestDownPosition.priceUpper)) {
        nearestDownPosition = position
      }
    }

    for (const position of downPositions.filter((p) => p !== nearestDownPosition)) {
      const richPosition = getPositionInfo(position)
      const originalUSD = richPosition.userLiquidityUSD()
      const needMove = isPositive(originalUSD) && isPositive(minus(originalUSD, config.ignoredPositionUsd * 1.2))
      if (needMove) {
        const txBuilderConfig = richPosition.buildPositionSetTxConfig({ usd: config.ignoredPositionUsd })
        if (txBuilderConfig) {
          downDecreaseClmmPositionTxConfigs.push(txBuilderConfig)
        }
      }
    }

    // show hand
    const richPosition = getPositionInfo(nearestDownPosition)
    const txBuilderConfig = richPosition.buildPositionShowHandTxConfig()
    if (txBuilderConfig) {
      downShowHandTxConfigs.push(txBuilderConfig)
    }
  }

  // ---------------- handle tasks (send tx) ----------------
  return {
    upDecreaseClmmPositionTxConfigs,
    downDecreaseClmmPositionTxConfigs,
    upShowHandTxConfigs,
    downShowHandTxConfigs,
  }
}

export function calcTotalClmmLiquidityUSD({
  clmmInfo,
  prices,
  tokens,
}: {
  clmmInfo: ClmmInfo
  prices: Prices | undefined
  tokens: Tokens | undefined
}) {
  if (!clmmInfo.userPositionAccounts) return {}
  const priceA = get(prices, clmmInfo.base)
  const priceB = get(prices, clmmInfo.quote)
  const tokenA = get(tokens, clmmInfo.base)
  const tokenB = get(tokens, clmmInfo.quote)
  if (!priceA || !priceB || !tokenA || !tokenB) return {}
  const totalLiquidityUSD = clmmInfo.userPositionAccounts.reduce((acc, position) => {
    const positionUSD = calcPositionUserPositionLiquidityUSD({
      tokenADecimals: tokenA?.decimals,
      tokenBDecimals: tokenB?.decimals,
      tokenAPrice: priceA,
      tokenBPrice: priceB,
      userPositionAccountAmountBN_A: position.amountBaseBN,
      userPositionAccountAmountBN_B: position.amountQuoteBN,
    })
    return positionUSD ? add(acc, positionUSD) : acc
  }, 0 as Numberish)

  return { totalLiquidityUSD }
}
