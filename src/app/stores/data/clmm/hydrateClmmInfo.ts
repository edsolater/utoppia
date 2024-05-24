import { add, div, mul } from "@edsolater/fnkit"
import { type ClmmPoolPersonalPosition as SDK_ClmmPoolPersonalPosition } from "@raydium-io/raydium-sdk"
import { parseSDKBN } from "../../../utils/dataStructures/BN"
import { parseSDKDecimal } from "../../../utils/dataStructures/Decimal"
import { toPercent } from "../../../utils/dataStructures/Percent"
import { toPubString } from "../../../utils/dataStructures/Publickey"
import type { PublicKey } from "../../../utils/dataStructures/type"
import type { ClmmInfo, ClmmJsonInfo, ClmmRewardInfo, ClmmSDKInfo, ClmmUserPositionAccount } from "../types/clmm"
import type { Prices } from "../store"
import type { Tokens } from "../token/type"

export const clmmInfoCache = new Map<string, ClmmInfo>()

type HydrateClmmInfosPayloads = {
  apiInfo: Record<PublicKey, ClmmJsonInfo>
  sdkInfo?: Record<PublicKey, ClmmSDKInfo | undefined>
  prices?: Prices
  tokens?: Tokens
}

export function hydrateClmmInfos(payload: HydrateClmmInfosPayloads): Record<PublicKey, ClmmInfo> {
  const result: Record<string, ClmmInfo> = {}
  for (const [id, api] of Object.entries(payload.apiInfo)) {
    const sdk = payload.sdkInfo?.[id]
    const composedInfo = hydrateOneClmmInfo({
      ...payload,
      jsonInfo: api,
      sdkInfo: sdk,
    })
    result[id] = composedInfo
    clmmInfoCache.set(id, composedInfo)
  }
  return result
}

type HydrateClmmInfoPayloads = {
  jsonInfo: ClmmJsonInfo
  sdkInfo?: ClmmSDKInfo
  prices?: Prices // TODO: load info in worker
  tokens?: Tokens // TODO: load info in worker
}

function hydrateOneClmmInfo(payload: HydrateClmmInfoPayloads): ClmmInfo {
  const currentPrice = payload.sdkInfo && parseSDKDecimal(payload.sdkInfo.state.currentPrice)

  const userPositionAccounts = payload.sdkInfo?.positionAccount
    ?.toSorted((a, b) => (a.priceLower.greaterThan(b.priceLower) ? -1 : a.priceLower.equals(b.priceLower) ? 0 : 1))
    .map((userPositionAccount) => {
      const amountBase = parseSDKBN(userPositionAccount.amountA)
      const amountQuote = parseSDKBN(userPositionAccount.amountB)
      const innerVolumeBase = mul(currentPrice!, amountBase) ?? 0
      const innerVolumeQuote = amountQuote ?? 0
      const positionPercentBase = toPercent(div(innerVolumeBase, add(innerVolumeBase, innerVolumeQuote)))
      const positionPercentQuote = toPercent(div(innerVolumeQuote, add(innerVolumeBase, innerVolumeQuote)))
      const priceLower = parseSDKDecimal(userPositionAccount.priceLower)
      return {
        rewardInfos: userPositionAccount.rewardInfos.slice(0, payload.jsonInfo.rewardInfos.length).map((i, idx) => ({
          token: toPubString(payload.jsonInfo.rewardInfos[idx].mint),
          penddingReward: parseSDKBN(i.pendingReward),
        })),
        liquidity: parseSDKBN(userPositionAccount.liquidity),
        inRange: checkIsInRange(payload.sdkInfo!, userPositionAccount),
        poolId: toPubString(userPositionAccount.poolId),
        nftMint: toPubString(userPositionAccount.nftMint),
        priceLower,
        priceUpper: parseSDKDecimal(userPositionAccount.priceUpper),
        amountBaseBN: amountBase,
        amountQuoteBN: amountQuote,
        tokenFeeAmountBase: parseSDKBN(userPositionAccount.tokenFeeAmountA),
        tokenFeeAmountQuote: parseSDKBN(userPositionAccount.tokenFeeAmountB),
        tokenBase: payload.jsonInfo.mintA,
        tokenQuote: payload.jsonInfo.mintB,
        leverage: userPositionAccount.leverage,
        tickLower: userPositionAccount.tickLower,
        tickUpper: userPositionAccount.tickUpper,
        positionPercentBase,
        positionPercentQuote,
      } satisfies ClmmUserPositionAccount
    })
  return {
    hasLoadJsonApi: Boolean(payload.jsonInfo),
    hasLoadSdk: Boolean(payload.sdkInfo),
    id: payload.jsonInfo.id,
    liquidity: parseSDKBN(payload.sdkInfo?.state.liquidity),
    tvl: payload.sdkInfo?.state.tvl,
    protocolFeeRate:
      payload.sdkInfo &&
      toPercent(div(payload.sdkInfo.state.ammConfig.protocolFeeRate, 10 ** 4), {
        alreadyDecimaled: true,
      }),
    ammConfig: payload.jsonInfo.ammConfig,
    base: payload.jsonInfo.mintA,
    baseProgramId: payload.jsonInfo.mintProgramIdA,
    baseDecimals: payload.jsonInfo.mintDecimalsA,
    quote: payload.jsonInfo.mintB,
    quoteProgramId: payload.jsonInfo.mintProgramIdB,
    quoteDecimals: payload.jsonInfo.mintDecimalsB,
    userPositionAccounts,
    creator: payload.sdkInfo && toPubString(payload.sdkInfo.state.creator),
    currentPrice,
    // change to shape
    feeApr: payload.sdkInfo && {
      "24h": toPercent(payload.sdkInfo.state.day.feeApr, { alreadyDecimaled: true }),
      "7d": toPercent(payload.sdkInfo.state.week.feeApr, { alreadyDecimaled: true }),
      "30d": toPercent(payload.sdkInfo.state.month.feeApr, { alreadyDecimaled: true }),
    },
    totalApr: payload.sdkInfo && {
      "24h": toPercent(payload.sdkInfo.state.day.apr, { alreadyDecimaled: true }),
      "7d": toPercent(payload.sdkInfo.state.week.apr, { alreadyDecimaled: true }),
      "30d": toPercent(payload.sdkInfo.state.month.apr, { alreadyDecimaled: true }),
    },
    volumeFee: payload.sdkInfo && {
      "24h": payload.sdkInfo.state.day.volumeFee,
      "7d": payload.sdkInfo.state.week.volumeFee,
      "30d": payload.sdkInfo.state.month.volumeFee,
    },
    volume: payload.sdkInfo && {
      "24h": payload.sdkInfo.state.day.volume,
      "7d": payload.sdkInfo.state.week.volume,
      "30d": payload.sdkInfo.state.month.volume,
    },
    rewardInfos: payload.jsonInfo.rewardInfos?.map(
      (i, idx) =>
        ({
          tokenMint: i.mint,
          tokenProgramId: i.programId,
          creator: payload.sdkInfo && toPubString(payload.sdkInfo.state.rewardInfos[idx].creator),
          stateCode: payload.sdkInfo?.state.rewardInfos[idx].rewardState,
          openTime: payload.sdkInfo && Number(parseSDKBN(payload.sdkInfo.state.rewardInfos[idx].openTime)),
          endTime: payload.sdkInfo && Number(parseSDKBN(payload.sdkInfo.state.rewardInfos[idx].endTime)),
          lastUpdateTime: payload.sdkInfo && Number(parseSDKBN(payload.sdkInfo.state.rewardInfos[idx].lastUpdateTime)),
          claimed: parseSDKBN(payload.sdkInfo?.state.rewardInfos[idx].rewardClaimed),
          totalEmissioned: parseSDKBN(payload.sdkInfo?.state.rewardInfos[idx].rewardTotalEmissioned),
          remainingRewards: parseSDKBN(payload.sdkInfo?.state.rewardInfos[idx].remainingRewards),
          perSecondBN: parseSDKDecimal(payload.sdkInfo?.state.rewardInfos[idx].perSecond),
          perDayBN: parseSDKDecimal(payload.sdkInfo?.state.rewardInfos[idx].perSecond.mul(86400)),
          perWeekBN: parseSDKDecimal(payload.sdkInfo?.state.rewardInfos[idx].perSecond.mul(86400 * 7)),
          apr: payload.sdkInfo && {
            "24h": toPercent(payload.sdkInfo.state.day.rewardApr[idx == 0 ? "A" : idx == 1 ? "B" : "C"], {
              alreadyDecimaled: true,
            }),
            "7d": toPercent(payload.sdkInfo.state.week.rewardApr[idx == 0 ? "A" : idx == 1 ? "B" : "C"], {
              alreadyDecimaled: true,
            }),
            "30d": toPercent(payload.sdkInfo.state.month.rewardApr[idx == 0 ? "A" : idx == 1 ? "B" : "C"], {
              alreadyDecimaled: true,
            }),
          },
        }) satisfies ClmmRewardInfo,
    ),
  }
}

function checkIsInRange(sdkInfo: ClmmSDKInfo, sdkPersonalPosition: SDK_ClmmPoolPersonalPosition): boolean {
  const currentPrice = sdkInfo.state.currentPrice
  const priceLower = sdkPersonalPosition.priceLower
  const priceUpper = sdkPersonalPosition.priceUpper
  return currentPrice.gt(priceLower) && currentPrice.lt(priceUpper)
}
