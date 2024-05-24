import { Clmm, ReturnTypeFetchMultiplePoolTickArrays, TradeV2 } from "@raydium-io/raydium-sdk"
import { Connection } from "@solana/web3.js"
import { SOLMint, WSOLMint } from "../../../configs/wellKnownMints"
import { toPub, toPubString } from "../../../utils/dataStructures/Publickey"
import { PoolJsonFile } from "../types/ammPools"

type SimulatePoolCacheType = Promise<Awaited<ReturnType<(typeof TradeV2)["fetchMultipleInfo"]>> | undefined>
type TickCache = Promise<ReturnTypeFetchMultiplePoolTickArrays | undefined>

// TODO: timeout-map
const sdkCaches: Map<
  string,
  {
    routes: ReturnType<(typeof TradeV2)["getAllRoute"]>
    tickCache: TickCache
    poolInfosCache: SimulatePoolCacheType
  }
> = new Map()

export function clearSdkCache() {
  sdkCaches.clear()
}

/**
 * api amm info → pre-sdk-paresed amm info
 */
export function sdkParseSwapAmmInfo({
  connection,
  inputMint,
  outputMint,

  apiPoolList,
  sdkParsedClmmPoolInfo,
}: {
  connection: Connection
  inputMint: string
  outputMint: string

  apiPoolList: PoolJsonFile
  sdkParsedClmmPoolInfo: Awaited<ReturnType<(typeof Clmm)["fetchMultiplePoolInfos"]>>
}) {
  const key = toPubString(inputMint) + toPubString(outputMint)
  if (!sdkCaches.has(key)) {
    const routes = TradeV2.getAllRoute({
      inputMint: toPub(inputMint),
      outputMint: toPub(outputMint),
      apiPoolList,
      clmmList: Object.values(sdkParsedClmmPoolInfo).map((i) => i.state),
    })
    const tickCache = Clmm.fetchMultiplePoolTickArrays({
      connection,
      poolKeys: routes.needTickArray,
      batchRequest: true,
    }).catch((err) => {
      sdkCaches.delete(key)
      return undefined
    })
    const poolInfosCache = TradeV2.fetchMultipleInfo({
      connection,
      pools: routes.needSimulate,
      batchRequest: true,
    }).catch((err) => {
      sdkCaches.delete(key)
      return undefined
    })

    sdkCaches.set(key, { routes, tickCache, poolInfosCache })
  }
  return sdkCaches.get(key)!
}
