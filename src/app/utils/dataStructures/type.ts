import { Numberish as Fnkit_Numberish, Fraction as Fnkit_Fraction } from "@edsolater/fnkit"
export type Mint = string /* just special in string content */
export type PublicKey = string /* just special in string content */
export type Address = PublicKey

// plain object for easier structure clone
export type Percent = Numberish

// plain object for easier structure clone
export type BN = Fraction

export type Price = Numberish

// this structure is not mathematics elegant
export interface Decimal {
  fraction: Numberish
  decimal: number
}

export type Fraction = Fnkit_Fraction

export type Numberish = Fnkit_Numberish

export type USDVolume = Numberish
