import { jFetch } from "../../../../packages/jFetch"
import { appApiUrls } from "../../../utils/common/config"
import { toRecord } from "@edsolater/fnkit"
import type { StoreData } from "../store"
import { type ClmmJsonFile, type ClmmJsonInfo } from "../types/clmm"

export const jsonClmmInfoCache = new Map<string, ClmmJsonInfo>()

console.log(globalThis)
export async function fetchClmmJsonInfo(canUseCache = true): Promise<StoreData["clmmJsonInfos"]> {
  // console.log('clmmJsonFile: ', 11)
  const clmmJsonFile = await jFetch<ClmmJsonFile>(appApiUrls.clmmPools, {
    cacheFreshTime: canUseCache ? 5 * 60 * 1000 : 0,
  })
  // console.log('clmmJsonFile: ', clmmJsonFile)
  if (!clmmJsonFile) return
  const jsonInfos = toRecord(clmmJsonFile.data as ClmmJsonInfo[], (i) => i.id) satisfies Record<string, ClmmJsonInfo>
  Promise.resolve().then(() => {
    for (const [id, info] of Object.entries(jsonInfos)) {
      jsonClmmInfoCache.set(id, info)
    }
  })
  return jsonInfos
}
