import { toRecord } from "@edsolater/fnkit"
import { jFetch } from "../../../../packages/jFetch"
import { appApiUrls } from "../../../utils/common/config"
import { StoreData } from "../store"
import { FarmJSON, FarmJSONFile } from "../types/farm"

export async function fetchFarmJsonInfo(): Promise<StoreData["farmJsonInfos"]> {
  const farmJsonFile = await jFetch<FarmJSONFile>(appApiUrls.farmInfo, { cacheFreshTime: 5 * 60 * 1000 })
  if (!farmJsonFile) return
  const stateInfos = farmJsonFile.stake.map((i) => ({ ...i, category: "stake" })) as FarmJSON[]
  const raydiumInfos = farmJsonFile.raydium.map((i) => ({ ...i, category: "raydium" })) as FarmJSON[]
  const fusionInfos = farmJsonFile.fusion.map((i) => ({ ...i, category: "fusion" })) as FarmJSON[]
  const ecosystemInfos = farmJsonFile.ecosystem.map((i) => ({ ...i, category: "ecosystem" })) as FarmJSON[]
  return toRecord(
    stateInfos.concat(raydiumInfos).concat(fusionInfos).concat(ecosystemInfos),
    (i) => i.id,
  ) satisfies StoreData["farmJsonInfos"]
}
