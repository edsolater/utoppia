/************ store ************
 * only in main thread
 *******************************/

import { createSmartStore } from "@edsolater/pivkit"
import { createShuck } from "../../../packages/conveyor/smartStore/shuck"
import { RAYMint, SOLMint } from "../../configs/wellKnownMints"
import type { TokenAccount } from "../../utils/dataStructures/TokenAccount"
import type { Mint, Numberish, Price, PublicKey } from "../../utils/dataStructures/type"
import type { TxVersion } from "../../utils/txHandler/txVersion"
import type { WalletAdapters } from "../wallet/type"
import { availableRpcs, type RPCEndpoint } from "./RPCEndpoint"
import { loadFarmJsonInfos } from "./portActions/loadFarmJsonInfos_main"
import { loadFarmSYNInfos } from "./portActions/loadFarmSYNInfos_main"
import { loadPairs } from "./portActions/loadPairs_main"
import { loadTokenPrice } from "./portActions/loadTokenPrice_main"
import { loadTokens } from "./portActions/loadTokens_main"
import type { Token, Tokens } from "./token/type"
import { loadOwnerTokenAccountsAndBalances } from "./tokenAccount&balance/loadOwnerTokenAccounts_main"
import type { ClmmInfos, ClmmJsonInfo } from "./types/clmm"
import type { FarmInfo, FarmJSON } from "./types/farm"
import type { PairInfo } from "./types/pairs"

export type StoreData = {
  // -------- swap --------
  swapLoadCount?: number // not good, should change automaticly. change this will start loading swap related info
  swapInputToken1: Mint | Token
  swapInputToken2: Mint | Token
  swapInputTokenAmount1?: Numberish
  swapInputTokenAmount2?: Numberish

  // -------- farms --------
  farmLoadCount?: number // not good, should change automaticly. change this will start loading farm related info
  farmJsonInfos?: Record<FarmJSON["id"], FarmJSON>
  isFarmJsonLoading?: boolean
  farmInfos?: Record<FarmInfo["id"], FarmInfo>
  isFarmInfosLoading?: boolean

  // -------- pairs --------
  pairLoadCount?: number // not good, should change automaticly. change this will start loading pair related info
  pairInfos?: Record<PairInfo["ammId"], PairInfo>
  isPairInfoLoading?: boolean

  // -------- token --------

  // -------- price --------
  priceLoadCount?: number // not good, should change automaticly. change this will start loading price related info
  isTokenPriceLoading?: boolean
  prices?: { mint: string; price: Numberish }[]

  // -------- app setting --------
  rpc?: RPCEndpoint
  txVersion?: TxVersion

  // -------- clmm --------
  clmmJsonInfos?: Record<string, ClmmJsonInfo>
  isClmmJsonInfoLoading?: boolean
  clmmInfos?: Record<string, any>
}

export const {
  store,
  unwrappedStore: storeData,
  setStore,
  createStorePropertySignal,
  createStorePropertySetter,
} = createSmartStore<StoreData>(
  { swapInputToken1: RAYMint, swapInputToken2: SOLMint, rpc: availableRpcs[0] },
  {
    onFirstAccess: {
      farmJsonInfos: loadFarmJsonInfos,
      farmInfos: loadFarmSYNInfos,
      pairInfos: loadPairs,
    },
  },
)
globalThis.document.addEventListener("DOMContentLoaded", () => {
  loadTokens()
  loadTokenPrice()
  loadOwnerTokenAccountsAndBalances()
  console.log("🤔")
})

export type Prices = Record<Mint, Price>
export type Balances = Record<Mint, Numberish>
export type TokenAccounts = Record<PublicKey, TokenAccount>

// TODO: should all state just use shuck
// token
export const shuck_isTokenPricesLoading = createShuck<boolean | undefined>()
export const shuck_tokenPrices = createShuck<Prices | undefined>()
export const shuck_isTokenListLoading = createShuck<boolean | undefined>()
export const shuck_isTokenListLoadingError = createShuck<boolean | undefined>()
export const shuck_tokens = createShuck<Tokens | undefined>()
// token accounts & balance
export const shuck_isTokenAccountsLoading = createShuck<boolean | undefined>()
export const shuck_tokenAccounts = createShuck<TokenAccounts | undefined>()
export const shuck_balances = createShuck<Balances | undefined>() // TODO: should extends by tokenAccounts
// wallet
export const shuck_walletAdapter = createShuck<WalletAdapters | undefined>()
export const shuck_walletConnected = createShuck(false)
export const shuck_owner = createShuck<string | undefined>()

// app settings
export const shuck_rpc = createShuck<RPCEndpoint | undefined>()
export const shuck_isMobile = createShuck<boolean | undefined>()
export const shuck_slippage = createShuck<Numberish>(0.003)
// clmm
export const shuck_isClmmJsonInfoLoading = createShuck<boolean | undefined>()
export const shuck_clmmInfos = createShuck<ClmmInfos | undefined>()
// clmm ui
export const allClmmTabs = ["ALL", "MY POOLS"] as const
export const shuck_uiCurrentClmmTab = createShuck<(typeof allClmmTabs)[number] | undefined>()

// export const rpc = createShuck<RPCEndpoint | undefined>(() => availableRpcs[0])

// export const {
//   store: rootStore,
//   branchStore: rootBranch,
//   setStore: setBStore,
// } = createBStore<StoreData>({
//   swapInputToken1: RAYMint,
//   swapInputToken2: SOLMint,
//   rpc: availableRpcs[0],
// })
