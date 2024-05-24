import { Numberish, assert, hasProperty, isDateAfter, makeTaskAbortable, shakeNil, inNextMainLoop } from "@edsolater/fnkit"
import {
  ClmmPoolInfo,
  ApiPoolInfoItem,
  ComputeAmountOutAmmLayout,
  ComputeAmountOutRouteLayout,
  PoolType,
  ReturnTypeFetchMultipleInfo,
  ReturnTypeGetAllRouteComputeAmountOut,
  TradeV2,
} from "@raydium-io/raydium-sdk"
import { getConnection } from "../connection/getConnection"
import { toSDKPercent } from "../../../utils/dataStructures/Percent"
import { toPubString } from "../../../utils/dataStructures/Publickey"
import { toSDKToken } from "../token/utils"
import { Token } from "../token/type"
import { TokenAmount, deUITokenAmount } from "../../../utils/dataStructures/TokenAmount"
import { Mint } from "../../../utils/dataStructures/type"
import { flatSDKReturnedInfo } from "../../../utils/sdkTools/flatSDKReturnedInfo"
import { fetchAmmPoolInfo } from "./fetchSwapAmmInfo"
import { sdkParseClmmInfos } from "./sdkParseClmmInfos"
import { sdkParseSwapAmmInfo } from "./sdkParseSwapAmmInfo"

export type CalculateSwapRouteInfosParams = Parameters<typeof calculateSwapRouteInfos>[0]
export type CalculateSwapRouteInfosResult = Awaited<ReturnType<typeof calculateSwapRouteInfos>["result"]>

type CacheKey = `${Mint}-${Mint}`

export type SDKBestResult = ComputeAmountOutAmmLayout | ComputeAmountOutRouteLayout

// TODO: it should be a max length cache map
interface SwapBestResultItem {
  params: {
    /** there will be only baseAmount or quoteAmount */
    input: Token
    output: Token
    inputAmount: TokenAmount
    slippageTolerance: Numberish
    rpcUrl: string
  }
  sdkBestResult: SDKBestResult
  timestamp: number
}

const swapBestResultCache = new Map<
  CacheKey,
  // TODO: it should be a max length cache map
  SwapBestResultItem
>()

let neariestSwapBestResultCache: SwapBestResultItem | undefined = undefined

export function getBestCalcResultCache() {
  return neariestSwapBestResultCache
}
/**
 * swap core calculation algorithm
 */
export function calculateSwapRouteInfos({
  rpcUrl,
  slippageTolerance = 0.05,
  input,
  output,
  inputAmount,
}: {
  rpcUrl: string
  slippageTolerance?: Numberish
  input: Token
  output: Token
  inputAmount: TokenAmount
}) {
  return makeTaskAbortable((canContinue) => {
    const fetchedAmmPoolInfoPromise = fetchAmmPoolInfo()
    const canContinueAsyncChecker = <T>(i: T): T => {
      assert(canContinue(), "task aborted")
      return i
    }
    const ClmmPromise = fetchedAmmPoolInfoPromise
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then((i) => i.Clmm)
      .then((Clmm) => {
        assert(Clmm, "Clmm api must be loaded")
        return Clmm
      })
    const apiPoolListPromise = fetchedAmmPoolInfoPromise
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then((i) => i.liquidity)
      .then((apiPoolList) => {
        assert(apiPoolList, "liquidity api must be loaded")
        return apiPoolList
      })
    const connection = getConnection(rpcUrl)
    const chainTime = Date.now() / 1000

    const sdkParsedClmmPoolInfoPromise = ClmmPromise.then(inNextMainLoop(canContinueAsyncChecker)).then(
      (clmmPoolInfos) => sdkParseClmmInfos({ connection, apiClmmInfos: clmmPoolInfos }),
    )

    const sdkParsedSwapAmmInfo = Promise.all([sdkParsedClmmPoolInfoPromise, apiPoolListPromise])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([sdkParsedClmmPoolInfo, apiPoolList]) =>
        sdkParseSwapAmmInfo({
          connection,
          inputMint: input.mint,
          outputMint: output.mint,
          apiPoolList,
          sdkParsedClmmPoolInfo,
        }),
      )

    const awaitedSimulateCache = sdkParsedSwapAmmInfo.then((info) => info.poolInfosCache)
    if (!awaitedSimulateCache) return

    const awaitedTickCache = sdkParsedSwapAmmInfo.then((info) => info.tickCache)
    if (!awaitedTickCache) return

    const routeList = sdkParsedSwapAmmInfo
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(async ({ poolInfosCache, tickCache, routes }) => {
        const [awaitedPoolInfosCache, awaitedTickCache] = await Promise.all([poolInfosCache, tickCache])
        assert(awaitedPoolInfosCache)
        assert(awaitedTickCache)

        // @ts-ignore
        return TradeV2.getAllRouteComputeAmountOut({
          directPath: routes.directPath,
          routePathDict: routes.routePathDict,
          simulateCache: awaitedPoolInfosCache,
          tickCache: awaitedTickCache,
          inputTokenAmount: deUITokenAmount(inputAmount),
          outputToken: toSDKToken(output),
          slippage: toSDKPercent(slippageTolerance),
          chainTime,
        })
      })

    const best = Promise.all([routeList, sdkParsedSwapAmmInfo.then((i) => i.poolInfosCache)])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([routeList, poolInfosCache]) => getBestCalcResult(routeList, poolInfosCache, chainTime))

    const swapInfo = Promise.all([routeList, best])
      .then(inNextMainLoop(canContinueAsyncChecker))
      .then(([routeList, best]) => ({
        routeList,
        bestResult: best?.bestResult,
        bestResultStartTimes: best?.bestResultStartTimes,
      }))

    // record swapInfo
    swapInfo.then(({ bestResult: sdkBestResult }) => {
      if (!canContinue()) return
      if (!sdkBestResult) return
      if (!rpcUrl) return
      const cacheKey = `${input.mint}-${output.mint}` as CacheKey
      const bestResultItem = {
        params: {
          input,
          output,
          inputAmount,
          slippageTolerance,
          rpcUrl,
        },
        sdkBestResult,
        timestamp: Date.now(),
      }
      swapBestResultCache.set(cacheKey, bestResultItem)
      neariestSwapBestResultCache = bestResultItem
    })
    return swapInfo.then((i) => flatSDKReturnedInfo(i))
  })
}

interface BestResultStartTimeInfo {
  ammId: string
  startTime: number
  poolType: PoolType
  poolInfo: BestResultStartTimePoolInfo
}

interface BestResultStartTimePoolInfo {
  rawInfo: ClmmPoolInfo | ApiPoolInfoItem
  ammId: string
  quoteMint: string
  baseMint: string
}

function getBestCalcResult(
  routeList: ReturnTypeGetAllRouteComputeAmountOut,
  poolInfosCache: ReturnTypeFetchMultipleInfo | undefined,
  chainTime: number,
):
  | {
      bestResult: ReturnTypeGetAllRouteComputeAmountOut[number]
      bestResultStartTimes?: BestResultStartTimeInfo[] /* only when bestResult is not ready */
    }
  | undefined {
  if (!routeList.length) return undefined
  const readyRoutes = routeList.filter((i) => i.poolReady)
  const hasReadyRoutes = Boolean(readyRoutes.length)
  if (hasReadyRoutes) {
    return { bestResult: readyRoutes[0] }
  } else {
    if (!poolInfosCache) return { bestResult: routeList[0] }

    const routeStartTimes = routeList[0].poolKey.map((i) => {
      const ammId = toPubString(i.id)
      const poolAccountInfo = i.version === 6 ? i : poolInfosCache[ammId]
      if (!poolAccountInfo) return undefined
      const startTime = Number(poolAccountInfo.startTime) * 1000
      const isPoolOpen = isDateAfter(chainTime, startTime)
      if (isPoolOpen) return undefined
      return { ammId, startTime, poolType: i, poolInfo: getPoolInfoFromPoolType(i) }
    })

    return { bestResult: routeList[0], bestResultStartTimes: shakeNil(routeStartTimes) }
  }
}

function getPoolInfoFromPoolType(poolType: PoolType): BestResultStartTimeInfo["poolInfo"] {
  return {
    rawInfo: poolType,
    ammId: toPubString(poolType.id),
    baseMint: isClmmPoolInfo(poolType) ? toPubString(poolType.mintA.mint) : poolType.baseMint,
    quoteMint: isClmmPoolInfo(poolType) ? toPubString(poolType.mintB.mint) : poolType.quoteMint,
  }
}

function isClmmPoolInfo(poolType: PoolType): poolType is ClmmPoolInfo {
  return hasProperty(poolType, "protocolFeesTokenA")
}
