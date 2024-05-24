import { ApiPoolInfo as SDK_ApiPoolInfo } from "@raydium-io/raydium-sdk"

// old AMM pool
export interface ApiPoolInfoV4 {
  id: string
  baseMint: string
  quoteMint: string
  lpMint: string
  baseDecimals: number
  quoteDecimals: number
  lpDecimals: number
  version: 4
  programId: string
  authority: string
  openOrders: string
  targetOrders: string
  baseVault: string
  quoteVault: string
  withdrawQueue: string
  lpVault: string
  marketVersion: 3
  marketProgramId: string
  marketId: string
  marketAuthority: string
  marketBaseVault: string
  marketQuoteVault: string
  marketBids: string
  marketAsks: string
  marketEventQueue: string
}

export interface ApiPoolInfoV5 {
  id: string
  baseMint: string
  quoteMint: string
  lpMint: string
  baseDecimals: number
  quoteDecimals: number
  lpDecimals: number
  version: 5
  programId: string
  authority: string
  openOrders: string
  targetOrders: string
  baseVault: string
  quoteVault: string
  withdrawQueue: string
  lpVault: string
  marketVersion: 3
  marketProgramId: string
  marketId: string
  marketAuthority: string
  marketBaseVault: string
  marketQuoteVault: string
  marketBids: string
  marketAsks: string
  marketEventQueue: string
  modelDataAccount: string
}

export type ApiPoolInfoItem = ApiPoolInfoV4 | ApiPoolInfoV5

export type PoolJsonFile = SDK_ApiPoolInfo
