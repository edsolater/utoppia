import type { Accessor } from "solid-js"
import type { Mint } from "../../../utils/dataStructures/type"

export interface TokenBase {
  mint: string // SOL's mint is PublicKey.default.toString() // WSOL(symbol is SOL) is 'So11111111111111111111111111111111111111112'
  decimals: number
  programId: string

  symbol?: string // WSOL has wrapped to SOL, SOL is SOL
  name?: string
}
/** minium data shape that can be hydrated to a SPLToken */

export interface Token extends TokenBase {
  readonly id: string // for object identity

  // --------- needed 🤔 computed data 😂? ----------
  extensions?: {
    coingeckoId?: string
    version?: "TOKEN2022"
  }
  realSymbol?: string // WSOL is WSOL, SOL is SOL. For normal tokens, this property is the same as symbol
  is?:
    | "default-empty-token" // fake status token
    | "loading-token" // fake status token
    | "error-token" // fake status token
    | "sol" // fake token
    | "raydium-official"
    | "raydium-unofficial"
    | "raydium-unnamed"
    | "raydium-blacklist" // online-info
  userAdded?: boolean // only if token is added by user // online-info
  icon?: string
  hasFreeze?: boolean // online-info
}

export type Tokens = Record<Mint, Token>

/** can transferm to token */
export type Tokenable = Mint | Token | Accessor<Mint> | Accessor<Token> | Accessor<Mint | Token>
