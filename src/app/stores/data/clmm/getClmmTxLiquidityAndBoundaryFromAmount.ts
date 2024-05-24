/**************************************************************************
 *
 * @tags CLMM utils data-calculation
 *
 **************************************************************************/

import { applyDecimal, div, mul, type Numberish, type Percent } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { parseSDKBN, toSDKBN } from "../../../utils/dataStructures/BN"
import { toPubString } from "../../../utils/dataStructures/Publickey"
import type { Amount } from "../../../utils/dataStructures/TokenAmount"
import { getEpochInfo } from "../connection/getEpochInfo"
import { getMultiMintInfos } from "../connection/getMultiMintInfos"
import isCurrentToken2022 from "../token/isCurrentToken2022"
import { getTransferAmountFee, parseSDKTransferAmountFee, type TransferAmountFee } from "../misc/transferAmountFee"
import { workerCache_tokens } from "../portActions/loadTokens_worker"
import { jsonClmmInfoCache } from "./fetchClmmJson"
import { sdkClmmInfoCache } from "../utils/sdkParseClmmInfos"

type ClmmPositionAmountBoundary = {
  liquidity: Numberish
  amountAInfo: TransferAmountFee
  amountBInfo: TransferAmountFee
}

/**
 * in worker thread
 */
export async function getClmmIncreaseTxLiquidityAndBoundaryFromAmount(payload: {
  amount: Amount
  rpcUrl: string
  clmmId: string
  positionNftMint: string

  amountSide: "A" | "B"
}): Promise<ClmmPositionAmountBoundary | undefined> {
  // console.log("input: ", toHumanReadable(payload))
  const epochInfoPromise = getEpochInfo({ rpcUrl: payload.rpcUrl })
  const jsonClmmInfo = jsonClmmInfoCache.get(payload.clmmId)
  if (!jsonClmmInfo) return undefined
  const token2022InfosPromise = getMultiMintInfos(
    [jsonClmmInfo.mintA, jsonClmmInfo.mintA].filter((m) => isCurrentToken2022(m, { tokens: workerCache_tokens })),
    { rpcUrl: payload.rpcUrl },
  )
  const sdkClmmInfo = sdkClmmInfoCache.get(payload.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === payload.positionNftMint,
  )

  if (!sdkClmmInfo || !sdkClmmPositionInfo) return undefined
  const isInputSideA = payload.amountSide === "A"
  const [epochInfo, token2022Infos] = await Promise.all([epochInfoPromise, token2022InfosPromise])
  const inputParams = {
    poolInfo: sdkClmmInfo.state,
    slippage: 0,
    inputA: isInputSideA,
    tickLower: sdkClmmPositionInfo.tickLower,
    tickUpper: sdkClmmPositionInfo.tickUpper,
    amount: toSDKBN(applyDecimal(payload.amount, -jsonClmmInfo.mintDecimalsA)),
    add: true,
    epochInfo,
    token2022Infos,
    amountHasFee: true,
  }
  // console.log("inputParams: ", toHumanReadable(inputParams))
  const { liquidity, amountA, amountB, amountSlippageA, amountSlippageB } =
    Clmm.getLiquidityAmountOutFromAmountIn(inputParams)
  const output = {
    liquidity: parseSDKBN(liquidity),
    amountAInfo: parseSDKTransferAmountFee(amountSlippageA),
    amountBInfo: parseSDKTransferAmountFee(amountSlippageB),
  }
  // console.log("output: ", output)
  return output
}

/**
 * in worker thread
 */
export async function getClmmDecreaseTxLiquidityAndBoundaryFromAmount(payload: {
  amount: Amount
  rpcUrl: string
  clmmId: string
  positionNftMint: string
  amountSide: "A" | "B"
}): Promise<ClmmPositionAmountBoundary | undefined> {
  const jsonClmmInfo = jsonClmmInfoCache.get(payload.clmmId)
  if (!jsonClmmInfo) return undefined
  const sdkClmmInfo = sdkClmmInfoCache.get(payload.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === payload.positionNftMint,
  )

  if (!sdkClmmInfo || !sdkClmmPositionInfo) return undefined

  const positionAmountA = parseSDKBN(sdkClmmPositionInfo.amountA)
  const positionAmountB = parseSDKBN(sdkClmmPositionInfo.amountB)
  const isInputSideA = payload.amountSide === "A"
  const inputRadio: Percent = div(
    applyDecimal(payload.amount, -jsonClmmInfo.mintDecimalsA),
    isInputSideA ? positionAmountA : positionAmountB,
  )
  const mintInfosPromise = getMultiMintInfos([jsonClmmInfo.mintA, jsonClmmInfo.mintB], {
    rpcUrl: payload.rpcUrl,
  })
  const epochInfoPromise = getEpochInfo({ rpcUrl: payload.rpcUrl })
  const [mintInfos, epochInfo] = await Promise.all([mintInfosPromise, epochInfoPromise])
  const mintInfoA = mintInfos[jsonClmmInfo.mintA]
  const mintInfoB = mintInfos[jsonClmmInfo.mintB]

  const inputAmountA = mul(inputRadio, positionAmountA)
  const inputAmountB = mul(inputRadio, positionAmountB)
  return {
    liquidity: mul(parseSDKBN(sdkClmmPositionInfo.liquidity), inputRadio),
    amountAInfo: getTransferAmountFee(inputAmountA, mintInfoA.feeConfig, epochInfo, false),
    amountBInfo: getTransferAmountFee(inputAmountB, mintInfoB.feeConfig, epochInfo, false),
  }
}
