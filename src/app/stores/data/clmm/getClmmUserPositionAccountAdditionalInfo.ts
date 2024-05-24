import {
  add,
  applyDecimal,
  assert,
  asyncMap,
  equal,
  get,
  gt,
  isExist,
  isFunction,
  isPositive,
  isZero,
  lt,
  mergeObjects,
  minus,
  mul,
  shakeNil,
  shrinkFn,
  toFormattedNumber,
  type AnyFn,
  type Numberish,
} from "@edsolater/fnkit"
import { toTokenAmount, type TokenAmount } from "../../../utils/dataStructures/TokenAmount"
import type { Price, USDVolume } from "../../../utils/dataStructures/type"
import { getEpochInfo } from "../connection/getEpochInfo"
import { getMultiMintInfos } from "../connection/getMultiMintInfos"
import { getTransferFeeInfo } from "../connection/getTransferFeeInfos"
import isCurrentToken2022 from "../token/isCurrentToken2022"
import { type Balances, type Prices } from "../store"
import type { Token, Tokens } from "../token/type"
import type { TxClmmPositionDecreaseConfig } from "../txClmmPositionDecrease"
import type { TxClmmPositionIncreaseConfig } from "../txClmmPositionIncrease"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  TxClmmPositionIncreaseUIFnParams,
  TxClmmPositionDecreaseUIFnParams,
  TxClmmPositionSetToUIFnParams,
} from "./useClmmUserPositionAccount"

export type AdditionalClmmUserPositionAccountMethods = {
  buildPositionIncreaseTxConfig: (params: TxClmmPositionIncreaseUIFnParams) => TxClmmPositionIncreaseConfig
  buildPositionDecreaseTxConfig: (params: TxClmmPositionDecreaseUIFnParams) => TxClmmPositionDecreaseConfig
  buildPositionSetTxConfig: (
    params: TxClmmPositionSetToUIFnParams,
  ) => TxClmmPositionIncreaseConfig | TxClmmPositionDecreaseConfig | undefined
  buildPositionShowHandTxConfig: () => TxClmmPositionIncreaseConfig | undefined
}

/** for pure js */
export type AdditionalClmmUserPositionAccount = {
  rangeName: () => string
  inRange: () => boolean
  userLiquidityUSD: () => USDVolume | undefined
  pendingRewardAmountUSD: () => Promise<Numberish | undefined>
  hasRewardTokenAmount: () => boolean
  isHarvestable: () => boolean
} & AdditionalClmmUserPositionAccountMethods

/** pure js, not solidjs reactive */
export function getClmmUserPositionAccountAdditionalInfo({
  clmmInfo,
  positionInfo,
  pricesMap,
  tokens,
  rpcUrl,
  owner,
  slippage,
  balances,
  tokenA,
  tokenB,
  priceA,
  priceB,
}: {
  clmmInfo: () => ClmmInfo
  positionInfo: () => ClmmUserPositionAccount
  pricesMap: () => Prices | undefined
  tokens: () => Tokens | undefined
  rpcUrl: () => string | undefined
  owner: () => string | undefined
  slippage: () => Numberish
  balances: () => Balances | undefined
  tokenA: () => Token
  tokenB: () => Token
  priceA: () => Price | undefined
  priceB: () => Price | undefined
}): AdditionalClmmUserPositionAccount {
  const userLiquidityUSD = () =>
    calcPositionUserPositionLiquidityUSD({
      tokenAPrice: priceA(),
      tokenBPrice: priceB(),
      tokenADecimals: tokenA().decimals,
      tokenBDecimals: tokenB().decimals,
      userPositionAccountAmountBN_B: positionInfo().amountBaseBN,
      userPositionAccountAmountBN_A: positionInfo().amountQuoteBN,
    })

  const hasRewardTokenAmount = () =>
    positionInfo().rewardInfos.length > 0 && positionInfo().rewardInfos.some((info) => isPositive(info.penddingReward))

  const rangeName = () =>
    `${toFormattedNumber(positionInfo().priceLower, { decimals: 4 })}-${toFormattedNumber(positionInfo().priceUpper, { decimals: 4 })}`

  const inRange = () => calcPositionInRange({ clmmInfo: clmmInfo(), positionInfo: positionInfo() })

  const rewardsAmountsWithFees = () =>
    calcPositionRewardsAmount({
      clmmInfo: clmmInfo(),
      positionInfo: positionInfo(),
      prices: pricesMap(),
      tokens: tokens(),
    })

  const feesAmountsWithFees = () =>
    calcPositionfeesAmounts({
      clmmInfo: clmmInfo(),
      positionInfo: positionInfo(),
      prices: pricesMap(),
      tokens: tokens(),
    })

  const hasFeeTokenAmount = () =>
    isPositive(positionInfo().tokenFeeAmountBase) || isPositive(positionInfo().tokenFeeAmountQuote)

  const pendingTotalWithFees = () =>
    rewardsAmountsWithFees()
      .concat(feesAmountsWithFees())
      .reduce(
        (acc, { tokenAmount, price }) => {
          if (!tokenAmount || !price) return acc
          return add(acc ?? 0, mul(tokenAmount.amount, price))
        },
        undefined as Numberish | undefined,
      )
  const pendingRewardAmountUSD = () =>
    calcPositionPendingRewardAmountUSD({
      clmmInfo: clmmInfo(),
      positionInfo: positionInfo(),
      rpcUrl: rpcUrl(),
      prices: pricesMap(),
      tokens: tokens(),
      feesAmountsWithFees,
      rewardsAmountsWithFees,
    })

  const isHarvestable = () => isPositive(pendingTotalWithFees()) || hasRewardTokenAmount() || hasFeeTokenAmount()

  const createBaseTxConfig = () => ({
    rpcUrl: rpcUrl(),
    owner: owner(),
    slippage: slippage(),
    clmmInfo: clmmInfo(),
    positionInfo: positionInfo(),
    privateKey: localStorage.getItem("private-key") || undefined,
  })

  const buildPositionIncreaseTxConfig = (params: TxClmmPositionIncreaseUIFnParams) => {
    return calcBuildTxClmmPositionIncreaseConfig(createBaseTxConfig(), params)
  }

  const buildPositionDecreaseTxConfig = (params: TxClmmPositionDecreaseUIFnParams) => {
    return calcBuildTxClmmPositionDecreaseConfig(createBaseTxConfig(), params)
  }

  const buildPositionSetTxConfig = (params: TxClmmPositionSetToUIFnParams) => {
    return calcBuildTxClmmPositionSetUSDConfig(
      {
        ...createBaseTxConfig(),
        tokenA: tokenA(),
        tokenB: tokenB(),
        tokenAPrice: priceA(),
        tokenBPrice: priceB(),
        tokenADecimals: tokenA().decimals,
        tokenBDecimals: tokenB().decimals,
      },
      params,
    )
  }

  const buildPositionShowHandTxConfig = () =>
    calcBuildPositionShowHandTxConfig({
      ...createBaseTxConfig(),
      tokenA: tokenA(),
      tokenB: tokenB(),
      tokenAPrice: priceA(),
      tokenBPrice: priceB(),
      tokenADecimals: tokenA().decimals,
      tokenBDecimals: tokenB().decimals,
      balances: balances(),
    })
  return {
    rangeName,
    inRange,
    userLiquidityUSD,
    pendingRewardAmountUSD,
    hasRewardTokenAmount,
    isHarvestable,

    buildPositionIncreaseTxConfig,
    buildPositionDecreaseTxConfig,
    buildPositionSetTxConfig,
    buildPositionShowHandTxConfig,
  }
}

export function calcPositionUserPositionLiquidityUSD(options: {
  tokenADecimals: number
  tokenBDecimals: number
  tokenAPrice: Price | undefined
  tokenBPrice: Price | undefined
  userPositionAccountAmountBN_A: Numberish | undefined
  userPositionAccountAmountBN_B: Numberish | undefined
}) {
  const tokenAPrices = options.tokenAPrice
  const tokenBPrices = options.tokenBPrice
  if (!tokenAPrices || !tokenBPrices) return undefined
  const tokenADecimal = options.tokenADecimals
  const tokenBDecimal = options.tokenBDecimals
  const amountABN = options.userPositionAccountAmountBN_B
  const amountBBN = options.userPositionAccountAmountBN_A
  if (amountABN === undefined || amountBBN === undefined) return undefined
  const amountA = applyDecimal(amountABN, tokenADecimal)
  const amountB = applyDecimal(amountBBN, tokenBDecimal)
  const wholeLiquidity = add(mul(amountA, tokenAPrices), mul(amountB, tokenBPrices))
  return wholeLiquidity
}
function calcPositionInRange(options: { clmmInfo: ClmmInfo; positionInfo: ClmmUserPositionAccount }) {
  return (
    gt(options.clmmInfo.currentPrice, options.positionInfo.priceLower) &&
    lt(options.clmmInfo.currentPrice, options.positionInfo.priceUpper)
  )
}
function calcPositionRewardsAmount(options: {
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  prices: Prices | undefined
  tokens: Tokens | undefined
}) {
  return (
    options.positionInfo?.rewardInfos.map((info) => {
      const price = info.token && options.prices && get(options.prices, info.token)

      const t = info.token ? get(options.tokens, info.token) : undefined
      return {
        tokenAmount: t && info.penddingReward ? toTokenAmount(t, info.penddingReward, { amountIsBN: true }) : undefined,
        price,
      }
    }) ?? []
  )
}
function calcPositionfeesAmounts(options: {
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  prices: Prices | undefined
  tokens: Tokens | undefined
}) {
  const t1 = options.positionInfo.tokenBase ? get(options.tokens, options.positionInfo.tokenBase) : undefined
  const t2 = options.positionInfo.tokenQuote ? get(options.tokens, options.positionInfo.tokenQuote) : undefined
  return options.positionInfo
    ? [
        {
          tokenAmount:
            t1 && options.positionInfo.tokenFeeAmountBase
              ? toTokenAmount(t1, options.positionInfo.tokenFeeAmountBase, { amountIsBN: true })
              : undefined,
          price:
            options.positionInfo.tokenBase && options.prices && get(options.prices, options.positionInfo.tokenBase),
        },
        {
          tokenAmount:
            t2 && options.positionInfo.tokenFeeAmountQuote
              ? toTokenAmount(t2, options.positionInfo.tokenFeeAmountQuote, { amountIsBN: true })
              : undefined,
          price:
            options.positionInfo.tokenQuote && options.prices && get(options.prices, options.positionInfo.tokenQuote),
        },
      ]
    : []
}

export async function calcPositionPendingRewardAmountUSD(options: {
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  rpcUrl: string | undefined

  prices: Prices | undefined
  tokens: Tokens | undefined
  feesAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Numberish | undefined
  }[]
  rewardsAmountsWithFees: () => {
    tokenAmount: TokenAmount | undefined
    price: Numberish | undefined
  }[]
}) {
  const rpcUrl = options.rpcUrl
  if (!rpcUrl) return undefined
  const tokensMap = options.tokens
  const feesAmounts = options.feesAmountsWithFees()
  const rewardsAmounts = options.rewardsAmountsWithFees()
  const mints = shakeNil(rewardsAmounts.concat(feesAmounts).map((i) => i.tokenAmount?.token.mint))

  const [epochInfo, mintInfos] = mints.some((m) => !isCurrentToken2022(m, { tokens: tokensMap }))
    ? []
    : await Promise.all([getEpochInfo({ rpcUrl: rpcUrl }), getMultiMintInfos(mints, { rpcUrl: rpcUrl })])

  const ams = await asyncMap(rewardsAmounts.concat(feesAmounts), async ({ tokenAmount, ...rest }) => {
    if (!tokenAmount) return
    const feeInfo = await getTransferFeeInfo({
      rpcUrl,
      tokens: tokensMap,
      tokenAmount,
      fetchedEpochInfo: epochInfo,
      fetchedMints: mintInfos,
    })
    return { ...rest, tokenAmount: feeInfo?.pure }
  })
  return shakeNil(ams).reduce(
    (acc, { tokenAmount, price }) => {
      if (!tokenAmount || !price) return acc
      return add(acc ?? 0, mul(tokenAmount.amount, price))
    },
    undefined as Numberish | undefined,
  )
}
/**
 * build tx config: clmm position increase
 */
function calcBuildTxClmmPositionIncreaseConfig(
  payload: {
    rpcUrl: string | undefined
    owner: string | undefined
    slippage: Numberish
    clmmInfo: ClmmInfo
    positionInfo: ClmmUserPositionAccount
    privateKey: string | undefined
  },
  params: TxClmmPositionIncreaseUIFnParams,
): TxClmmPositionIncreaseConfig {
  const rpcUrl = payload.rpcUrl
  assert(rpcUrl, "for clmm position increase, rpc url not ready")
  const owner = payload.owner
  assert(owner, "for clmm position increase, owner not ready")
  const clmmId = payload.clmmInfo.id
  const positionNftMint = payload.positionInfo.nftMint
  const slippage = payload.slippage
  const privateKey = payload.privateKey
  return {
    name: "clmm position increase",
    params: {
      ...params,
      privateKey,
      clmmId,
      positionNftMint,
      rpcUrl,
      owner,
      slippage,
    },
  }
}
/**
 * build tx config: clmm position decrease
 */
function calcBuildTxClmmPositionDecreaseConfig(
  payload: {
    rpcUrl: string | undefined
    owner: string | undefined
    slippage: Numberish
    clmmInfo: ClmmInfo
    positionInfo: ClmmUserPositionAccount
    privateKey: string | undefined
  },
  params: TxClmmPositionDecreaseUIFnParams,
): TxClmmPositionDecreaseConfig {
  const rpcUrl = payload.rpcUrl
  assert(rpcUrl, "for clmm position decrease, rpc url not ready")
  const owner = payload.owner
  assert(owner, "for clmm position decrease, owner not ready")
  const clmmId = payload.clmmInfo.id
  const positionNftMint = payload.positionInfo.nftMint
  const slippage = payload.slippage
  const privateKey = payload.privateKey
  return {
    name: "clmm position decrease",
    params: {
      ...params,
      privateKey,
      clmmId,
      positionNftMint,
      rpcUrl,
      owner,
      slippage,
    },
  }
}
/** a shortcut of {@link txPositionDecrease} and {@link txPositionIncrease} */
function calcBuildTxClmmPositionSetUSDConfig(
  payload: {
    rpcUrl: string | undefined
    owner: string | undefined
    slippage: Numberish
    clmmInfo: ClmmInfo
    positionInfo: ClmmUserPositionAccount
    tokenA: Token
    tokenB: Token
    tokenAPrice: Numberish | undefined
    tokenBPrice: Numberish | undefined
    tokenADecimals: number
    tokenBDecimals: number
    privateKey: string | undefined
  },
  params: TxClmmPositionSetToUIFnParams,
) {
  const rpcUrl = payload.rpcUrl
  assert(rpcUrl, "for clmm position decrease, rpc url not ready")
  const owner = payload.owner
  assert(owner, "for clmm position decrease, owner not ready")
  // const clmmId = clmmInfo.id
  // const positionNftMint = userPositionAccount.nftMint
  // const slippage = slippageS()
  const originalUSD = calcPositionUserPositionLiquidityUSD({
    tokenADecimals: payload.tokenADecimals,
    tokenBDecimals: payload.tokenBDecimals,
    tokenAPrice: payload.tokenAPrice,
    tokenBPrice: payload.tokenBPrice,
    userPositionAccountAmountBN_A: payload.positionInfo.amountBaseBN,
    userPositionAccountAmountBN_B: payload.positionInfo.amountQuoteBN,
  })
  assert(originalUSD, "oops😅, origin usd is empty")
  if (equal(params.usd, originalUSD)) {
    console.warn(`seems no need to increase/decrease, liuidity is already $${toFormattedNumber(params.usd)} `)
    return
  } else if (lt(params.usd, originalUSD)) {
    const decreaseUSDAmount = minus(originalUSD, params.usd)
    if (gt(payload.clmmInfo.currentPrice, payload.positionInfo.priceUpper)) {
      //  amountSide "B"
      const price = payload.tokenBPrice
      assert(price, `price of ${payload.tokenB.symbol} not ready`)
      const amount = mul(decreaseUSDAmount, price)
      return calcBuildTxClmmPositionDecreaseConfig(
        {
          ...payload,
          rpcUrl,
          owner,
        },
        { amountB: amount },
      )
    } else if (lt(payload.clmmInfo.currentPrice, payload.positionInfo.priceLower)) {
      //  amountSide "A"
      const price = payload.tokenAPrice
      assert(price, `price of ${payload.tokenA.symbol} not ready`)
      const amount = mul(decreaseUSDAmount, price)
      return calcBuildTxClmmPositionDecreaseConfig(
        {
          ...payload,
          rpcUrl,
          owner,
        },
        { amountA: amount },
      )
    } else {
      // throw new Error("//TEMPDEV currently not support in range decrease")
    }
  } else {
    const increaseUSDAmount = minus(params.usd, originalUSD)
    if (gt(payload.clmmInfo.currentPrice, payload.positionInfo.priceUpper)) {
      //  amountSide "B"
      const price = payload.tokenBPrice
      assert(price, `price of ${payload.tokenB.symbol} not ready`)
      const amount = mul(increaseUSDAmount, price)
      return calcBuildTxClmmPositionIncreaseConfig(
        {
          ...payload,
          rpcUrl,
          owner,
        },
        { amountB: amount },
      )
    } else if (lt(payload.clmmInfo.currentPrice, payload.positionInfo.priceLower)) {
      //  amountSide "A"
      const price = payload.tokenAPrice
      assert(price, `price of ${payload.tokenA.symbol} not ready`)
      const amount = mul(increaseUSDAmount, price)
      return calcBuildTxClmmPositionIncreaseConfig(
        {
          ...payload,
          rpcUrl,
          owner,
        },
        { amountA: amount },
      )
    } else {
      // throw new Error("//TEMPDEV currently not support in range increase")
    }
  }
}
function calcBuildPositionShowHandTxConfig(payload: {
  rpcUrl: string | undefined
  owner: string | undefined
  slippage: Numberish
  clmmInfo: ClmmInfo
  positionInfo: ClmmUserPositionAccount
  tokenA: Token
  tokenB: Token
  tokenAPrice: Numberish | undefined
  tokenBPrice: Numberish | undefined
  tokenADecimals: number
  tokenBDecimals: number
  balances: Balances | undefined
  privateKey: string | undefined
}) {
  console.log("balances: ", payload.balances?.["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"])
  const side = gt(payload.clmmInfo.currentPrice, payload.positionInfo.priceUpper) ? "B" : "A"
  const balanceOfTargetSideRawBN = get(payload.balances, side === "A" ? payload.clmmInfo.base : payload.clmmInfo.quote)
  if (!balanceOfTargetSideRawBN || isZero(balanceOfTargetSideRawBN)) {
    console.warn(`seems no need to increase, ${side} balance is empty`)
    return
  }
  const balanceOfTargetSide = isExist(balanceOfTargetSideRawBN)
    ? toTokenAmount(side === "A" ? payload.tokenA : payload.tokenB, balanceOfTargetSideRawBN, { amountIsBN: true })
    : undefined
  assert(balanceOfTargetSide, "balance of target side not exist")
  return calcBuildTxClmmPositionIncreaseConfig(
    payload,
    side === "A" ? { amountA: balanceOfTargetSide.amount } : { amountB: balanceOfTargetSide.amount },
  )
}
type ShrinkProperties<O extends object> = {
  [K in keyof O]: O[K] extends AnyFn ? ReturnType<O[K]> : O[K]
}
/**
 * ShrinkifyObj<{a: number}> = {a: number | () => number}
 */
type ShrinkifyObj<O extends object> = {
  [K in keyof O]: O[K] extends AnyFn ? O[K] : O[K] | (() => O[K])
}
function shrinkProperties<O extends object>(obj: O): ShrinkProperties<O> {
  const shrinkedO = {} as ShrinkProperties<O>
  for (const key in obj) {
    if (isFunction(obj[key])) {
      shrinkedO[key] = shrinkFn(obj[key])
    }
  }
  return mergeObjects(obj, shrinkedO)
}
