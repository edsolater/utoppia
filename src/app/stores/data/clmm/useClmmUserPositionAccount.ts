import { createObjectFromGetters, mergeObjects, type Numberish } from "@edsolater/fnkit"
import { usePromise } from "@edsolater/pivkit"
import { useShuckValue } from "../../../../packages/conveyor/solidjsAdapter/useShuck"
import { type Amount } from "../../../utils/dataStructures/TokenAmount"
import type { USDVolume } from "../../../utils/dataStructures/type"
import { shuck_balances, shuck_owner, shuck_rpc, shuck_slippage, shuck_tokenPrices, shuck_tokens } from "../store"
import { useToken } from "../token/useToken"
import { useTokenPrice } from "../tokenPrice/useTokenPrice"
import type { ClmmInfo, ClmmUserPositionAccount } from "../types/clmm"
import {
  AdditionalClmmUserPositionAccountMethods,
  getClmmUserPositionAccountAdditionalInfo,
} from "./getClmmUserPositionAccountAdditionalInfo"

/** for solidjs store */
type AdditionalClmmUserPositionAccountState = {
  rangeName: string
  inRange: boolean
  userLiquidityUSD: USDVolume | undefined
  pendingRewardAmountUSD: Numberish | undefined
  hasRewardTokenAmount: boolean
  isHarvestable: boolean
} & AdditionalClmmUserPositionAccountMethods

/** for {@link AdditionalClmmUserPositionAccountState}'s method txClmmPositionIncrease */
export type TxClmmPositionIncreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
/** for {@link AdditionalClmmUserPositionAccountState}'s method txClmmPositionDecrease */
export type TxClmmPositionDecreaseUIFnParams = { amountA: Amount } | { amountB: Amount }
export type TxClmmPositionSetToUIFnParams = { usd: Amount }

/**
 * hooks
 * hydrate {@link ClmmUserPositionAccount} to ui used data
 */
// TODO: should move inner to calcXXX() functions
export function useClmmUserPositionAccount(
  clmmInfo: ClmmInfo,
  positionInfo: ClmmUserPositionAccount,
): AdditionalClmmUserPositionAccountState & ClmmUserPositionAccount {
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

  const {
    rangeName,
    inRange,
    userLiquidityUSD,
    pendingRewardAmountUSD: pendingRewardAmountUSDPromise,
    hasRewardTokenAmount,
    isHarvestable,
    buildPositionIncreaseTxConfig,
    buildPositionDecreaseTxConfig,
    buildPositionSetTxConfig,
    buildPositionShowHandTxConfig,
  } = getClmmUserPositionAccountAdditionalInfo({
    clmmInfo: () => clmmInfo,
    positionInfo: () => positionInfo,
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
  const pendingRewardAmountUSD = usePromise(pendingRewardAmountUSDPromise)
  return mergeObjects(
    positionInfo,
    createObjectFromGetters({
      rangeName,
      inRange,
      userLiquidityUSD,
      pendingRewardAmountUSD,
      hasRewardTokenAmount,
      isHarvestable,
    }),
    {
      buildPositionIncreaseTxConfig,
      buildPositionDecreaseTxConfig,
      buildPositionSetTxConfig,
      buildPositionShowHandTxConfig,
    },
  ) as any
}
