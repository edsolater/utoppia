import { MayPromise } from "@edsolater/fnkit"
import { jFetch } from "../../../../packages/jFetch"
import { appApiUrls } from "../../../utils/common/config"
import type { PoolJsonFile } from "../types/ammPools"
import type { ClmmJsonFile, ClmmJsonInfo } from "../types/clmm"

const apiCache = {} as {
  Clmm?: MayPromise<ClmmJsonInfo[] | undefined>
  liquidity?: MayPromise<PoolJsonFile | undefined>
}

export function clearApiCache() {
  apiCache.Clmm = undefined
  apiCache.liquidity = undefined
}

async function fetchClmmPoolInfo(): Promise<ClmmJsonInfo[] | undefined> {
  return jFetch<ClmmJsonFile>(appApiUrls.clmmPools, { cacheFreshTime: 1000 * 60 * 5 }).then((r) => r?.data) // note: previously Rudy has Test API for dev
}

async function fetchOldAmmPoolInfo() {
  return jFetch<PoolJsonFile>(appApiUrls.poolInfo, { cacheFreshTime: 1000 * 60 * 5 })
}

/**
 * api amm info
 */
export async function fetchAmmPoolInfo() {
  if (!apiCache.Clmm) {
    apiCache.Clmm = fetchClmmPoolInfo()
  }
  if (!apiCache.liquidity) {
    apiCache.liquidity = fetchOldAmmPoolInfo()
  }
  return apiCache
}

export function prefetch() {
  // TODO: should only prefetch in swap page
  console.info("[prefetch] start prefetch ammPoolInfo")
  // fetchAmmPoolInfo()
}

// apply prefetch (ammPoolInfo)
prefetch()
