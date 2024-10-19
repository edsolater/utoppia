export type Base58Address = string
export type MintAddress = Base58Address

export type SolanaTokenInfo = {
  mint: MintAddress
  decimal: number
  name: string // can used in https://www.coingecko.com/sentiment_votes/voted_coin_today?api_symbol={name}
}

// in solana
export const SOL = {
  mint: 'So11111111111111111111111111111111111111112',
  decimal: 9,
  name: 'solana',
} satisfies SolanaTokenInfo

// in solana
export const RAY = {
  mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  decimal: 6,
  name: 'raydium',
} satisfies SolanaTokenInfo

// in solana
export const USDC = {
  mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  decimal: 6,
  name: 'usd-coin',
} satisfies SolanaTokenInfo

// in solana
export const USDT = {
  mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  decimal: 6,
  name: 'tether',
} satisfies SolanaTokenInfo

// in solana
export const ETH = {
  mint: '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs',
  decimal: 8,
  name: 'ethereum',
} satisfies SolanaTokenInfo

// in solana
export const BTC = {
  mint: '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh',
  decimal: 8,
  name: 'bitcoin',
} satisfies SolanaTokenInfo
