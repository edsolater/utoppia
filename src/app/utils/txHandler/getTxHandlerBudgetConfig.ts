import { ComputeBudgetConfig } from "@raydium-io/raydium-sdk"
import { jFetch } from "../../../packages/jFetch"

interface SolanaFeeInfo {
  min: number
  max: number
  avg: number
  priorityTx: number
  nonVotes: number
  priorityRatio: number
  avgCuPerBlock: number
  blockspaceUsageRatio: number
}

type SolanaFeeInfoJson = {
  "1": SolanaFeeInfo
  "5": SolanaFeeInfo
  "15": SolanaFeeInfo
}

/**
 * increase SDK performance
 */
export async function getTxHandlerBudgetConfig(): Promise<ComputeBudgetConfig | undefined> {
  const json = await jFetch<SolanaFeeInfoJson>("https://solanacompass.com/api/fees", { cacheFreshTime:  5 * 60 * 1000 })
  const { avg } = json?.[15] ?? {}
  if (!avg) return undefined // fetch error
  return {
    units: 600000,
    microLamports: Math.min(Math.ceil((avg * 1000000) / 600000), 25000)
  } as ComputeBudgetConfig
}
