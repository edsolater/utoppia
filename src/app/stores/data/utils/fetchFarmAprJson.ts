import { jFetch } from "../../../../packages/jFetch"
import { FarmAprJSONInfo } from "../types/farm"

export async function fetchFarmAprJsonFile(options: { url: string }): Promise<Map<string, FarmAprJSONInfo>> {
  const result = await jFetch<{ data: FarmAprJSONInfo[] }>(options.url, { cacheFreshTime: 5 * 60 * 1000 })
  if (!result) return new Map()
  return new Map(result.data.map((info) => [info.id, info] as const))
}
