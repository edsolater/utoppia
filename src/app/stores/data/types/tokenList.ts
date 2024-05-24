import { Token } from "../token/type"

export interface TokenWorkerData {
  tokens: Token[]
  blacklist: string[]
}

export interface FetchRaydiumTokenListOptions {
  url: string
  force?: boolean
}

export interface RaydiumTokenListJsonFile {
  official: Token[]
  unOfficial: Token[]
  unNamed: Token[]
  blacklist: string[]
}

export interface TokenListStore {
  isTokenLoading?: boolean
  tokens?: Token[]
}
