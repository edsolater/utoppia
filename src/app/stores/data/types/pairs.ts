export interface FetchPairsOptions {
  force?: boolean
}

export interface PairJson {
  ammId: string
  apr24h: number
  apr7d: number
  apr30d: number
  fee7d: number
  fee7dQuote: number
  fee24h: number
  fee24hQuote: number
  fee30d: number
  fee30dQuote: number
  liquidity: number
  lpMint: string
  lpPrice: number | null // lp price directly. (No need to mandually calculate it from liquidity list)
  market: string
  name: string
  official: boolean
  price: number // swap price forwrard. for example, if pairId is 'ETH-USDC', price is xxx USDC/ETH
  tokenAmountCoin: number
  tokenAmountLp: number
  tokenAmountPc: number
  volume7d: number
  volume7dQuote: number
  volume24h: number
  volume24hQuote: number
  volume30d: number
  volume30dQuote: number
}

export interface PairInfo {
  ammId: string
  apr24h: number
  apr7d: number
  apr30d: number
  fee7d: number
  fee7dQuote: number
  fee24h: number
  fee24hQuote: number
  fee30d: number
  fee30dQuote: number
  liquidity: number
  lpMint: string
  lpPrice: number | null // lp price directly. (No need to mandually calculate it from liquidity list)
  market: string
  name: string
  official: boolean
  price: number // swap price forwrard. for example, if pairId is 'ETH-USDC', price is xxx USDC/ETH
  tokenAmountCoin: number
  tokenAmountLp: number
  tokenAmountPc: number
  volume7d: number
  volume7dQuote: number
  volume24h: number
  volume24hQuote: number
  volume30d: number
  volume30dQuote: number
}
export interface PairsStore {
  readonly pairInfos?: PairInfo[]
  readonly isPairInfoLoading?: boolean
}
