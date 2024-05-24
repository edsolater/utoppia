import { ApiFarmApr } from "@raydium-io/raydium-sdk"
import { BN } from "../../../utils/dataStructures/BN"
import { Mint, Numberish, Percent, Price, PublicKey as PublicKey } from "../../../utils/dataStructures/type"
import { TokenAmount } from "../../../utils/dataStructures/TokenAmount"

export interface FetchFarmsJSONPayloads {
  force?: boolean
}

export interface CalculateSwapRouteInfosParams {
  rpcUrl: string
  owner?: string
}

export interface FarmRewardJSONInfo {
  rewardMint: string
  rewardVault: string
  rewardOpenTime?: number // only v6
  rewardEndTime?: number // only v6
  rewardPerSecond?: string | number // only v6
  rewardSender?: string // only v6
  rewardType?: "Standard SPL" | "Option tokens" // only v6
}

export type FarmAprJSONInfo = ApiFarmApr

export interface FarmJSON {
  id: string
  symbol: string
  lpMint: string
  lpVault: string

  baseMint: string
  quoteMint: string

  version: number
  programId: string

  authority: string
  creator?: string
  rewardInfos: FarmRewardJSONInfo[]
  upcoming: boolean

  rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
  rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
  rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

  local?: boolean // only if it is in localstorage(create just by user)
  category: "stake" | "raydium" | "fusion" | "ecosystem" // add by UI for unify the interface
}

export interface FarmJSONFile {
  name: string
  version: unknown
  stake: Omit<FarmJSON, "category">[]
  raydium: Omit<FarmJSON, "category">[]
  fusion: Omit<FarmJSON, "category">[]
  ecosystem: Omit<FarmJSON, "category">[]
}

export interface FarmInfo {
  hasLoad: ("sdk" | "api" | "ledger" | undefined)[] // easier detect info load progress
  base: Mint
  quote: Mint
  lp: Mint
  lpPrice: Price

  id: PublicKey
  name: string
  ammId: PublicKey
  programId: PublicKey
  authority: PublicKey
  category: "stake" | "raydium" | "fusion" | "ecosystem" // add by UI for unify the interface

  /** only for v3/v5 */
  isDualFusionPool: boolean
  isNormalFusionPool: boolean
  isClosedPool: boolean
  isStakePool: boolean
  isUpcomingPool: boolean
  isStablePool: boolean
  /** new pool shoud sort in highest  */
  isNewPool: boolean

  raydiumFeeApr: {
    // raydium fee for each transaction
    "7d": Percent
    "30d": Percent
    "24h": Percent
  }

  tvl?: Numberish // only when sdk is ready

  userHasStaked: boolean
  rewards: {
    apr?: {
      // farm's rewards apr
      "7d": Percent
      "30d": Percent
      "24h": Percent
    } // fulfilled if liquidity API jFetch is ready
    // userHavePendingReward: boolean // logic is too complicated
    pendingRewardsBN?: BN /** only when user have deposited and connected wallet */
    token: Mint | undefined
    /** only when user have deposited and connected wallet */
    userPendingReward: TokenAmount | undefined
    farmVersion: 3 | 5 | 6
    rewardVault: PublicKey
    openTime?: Date // v6
    endTime?: Date // v6
    // this reward is sent by who
    sender: FarmRewardJSONInfo["rewardSender"] // v6

    isOptionToken?: boolean // v6
    isRewarding?: boolean // v6
    isRewardBeforeStart?: boolean // v6
    isRewardEnded?: boolean // v6
    isRwardingBeforeEnd72h?: boolean // v6

    rewardPeriodMin?: number // v6 '7-90 days's     7 * 24 * 60 * 60 seconds
    rewardPeriodMax?: number // v6 '7-90 days's     90 * 24 * 60 * 60 seconds
    rewardPeriodExtend?: number // v6 'end before 72h's    72 * 60 * 60 seconds

    claimableRewards?: TokenAmount // v6
    owner?: string // v6
    perSecond: FarmRewardJSONInfo["rewardPerSecond"] // v6
    type: FarmRewardJSONInfo["rewardType"] // v6
  }[]
  userStakedLpAmount?: TokenAmount
  totalStakedLpAmount: TokenAmount

  // rewardInfos: FarmRewardJSONInfo[]

  /** only when user have deposited and connected wallet */
  ledger?: {
    id: PublicKey
    owner: PublicKey
    state: BN
    deposited: BN
    rewardDebts: BN[]
  }

  // wrapped?: {
  //   pendingRewards: BN[]
  // }x
}

export interface FarmStore {
  readonly farmJsonInfos?: FarmJSON[]
  readonly isFarmJsonLoading?: boolean
  readonly farmInfos?: FarmInfo[]
  readonly isFarmInfosLoading?: boolean
}
