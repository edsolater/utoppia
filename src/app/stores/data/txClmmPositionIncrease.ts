/**************************************************************************
 *
 * @tags CLMM tx
 * ActionLabel = "clmm position increase"
 *
 **************************************************************************/

import { assert, isLessThanOne, isPositive, minus, mul, type Percent } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { toSDKBN } from "../../utils/dataStructures/BN"
import { getConnection } from "./connection/getConnection"
import { toPubString } from "../../utils/dataStructures/Publickey"
import type { Amount } from "../../utils/dataStructures/TokenAmount"
import { getTxHandlerUtils, type TxParams } from "../../utils/txHandler"
import { handleTxModule, type TransactionModule } from "../../utils/txHandler/handleTxFromShortcut"
import { getClmmIncreaseTxLiquidityAndBoundaryFromAmount } from "./clmm/getClmmTxLiquidityAndBoundaryFromAmount"
import { isTokenSOLWSOL } from "./token/utils"
import { jsonClmmInfoCache } from "./clmm/fetchClmmJson"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"
import { toHumanReadable } from "./utils/toHumanReadable"
import { reportLog } from "./utils/logger"

export type TxClmmPositionIncreaseConfig = { name: "clmm position increase"; params: TxClmmPositionIncreaseParams }

export type TxClmmPositionIncreaseParams = TxParams<{
  rpcUrl: string
  owner: string
  clmmId: string
  positionNftMint: string
  slippage: Percent // e.g. 0.01

  amountA?: Amount
  amountB?: Amount
}>

/** need amountA or amountB */
export async function txClmmPositionIncrease(params: TxClmmPositionIncreaseParams) {
  return handleTxModule(await createTxClmmPositionIncreaseTransactionModule(params))
}

/** need amountA or amountB */
export async function createTxClmmPositionIncreaseTransactionModule(
  params: TxClmmPositionIncreaseParams,
): Promise<TransactionModule> {
  const amount = "amountA" in params ? params.amountA : params.amountB
  const amountSide = "amountA" in params ? "A" : "B"
  reportLog("[⚙️worker]{tx clmm position increase} start compose tx clmm position increase")
  assert(isLessThanOne(params.slippage), `slippage shouldnot bigger than 1, slippage: ${params.slippage}`)
  assert(isPositive(amount), "amountA should be positive")
  const connection = getConnection(params.rpcUrl)
  assert(connection, "connection not ready, connection: " + connection)
  const jsonClmmInfo = jsonClmmInfoCache.get(params.clmmId)
  assert(jsonClmmInfo, "jsonClmmInfo not ready, jsonClmmInfo: " + jsonClmmInfo)
  const sdkClmmInfo = sdkClmmInfoCache.get(params.clmmId)
  const sdkClmmPositionInfo = sdkClmmInfo?.positionAccount?.find(
    (p) => toPubString(p.nftMint) === params.positionNftMint,
  )
  assert(sdkClmmInfo, "sdkClmmInfo not ready, sdkClmmInfo: " + sdkClmmInfo)
  assert(sdkClmmPositionInfo, "sdkClmmPositionInfo not ready, sdkClmmPositionInfo: " + sdkClmmPositionInfo)

  const { owner, getSDKBudgetConfig, getSDKTokenAccounts, sdkTxVersion, sdkLookupTableCache } = getTxHandlerUtils({
    rpcUrl: params.rpcUrl,
    owner: params.owner,
  })

  // ------------------ calc amount info ------------------
  const infoPromise = getClmmIncreaseTxLiquidityAndBoundaryFromAmount({
    amount,
    rpcUrl: params.rpcUrl,
    clmmId: params.clmmId,
    positionNftMint: params.positionNftMint,
    amountSide,
  })

  // ------------------ build transaction ------------------
  const txBudgetConfigPromise = getSDKBudgetConfig()
  const sdkTokenAccountsPromise = getSDKTokenAccounts({ canUseCache: false })
  const [info, txBudgetConfig, sdkTokenAccounts] = await Promise.all([
    infoPromise,
    txBudgetConfigPromise,
    sdkTokenAccountsPromise,
  ])
  assert(info, `${getClmmIncreaseTxLiquidityAndBoundaryFromAmount.name} fail to work`)
  const { liquidity, amountAInfo, amountBInfo } = info
  const amountA = amountAInfo.amountWithFeeBN
  const amountB = amountBInfo.amountWithFeeBN
  console.log(txBudgetConfig)
  assert(txBudgetConfig, "txBudgetConfig can't load")
  assert(sdkTokenAccounts, "token account can't load")
  const treatWalletSolAsPoolBalance = isTokenSOLWSOL(jsonClmmInfo.mintA) || isTokenSOLWSOL(jsonClmmInfo.mintB)
  const liquidityMin = mul(liquidity, minus(1, params.slippage))
  const txParams = {
    connection,
    liquidity: toSDKBN(liquidityMin),
    poolInfo: sdkClmmInfo.state,
    ownerInfo: {
      feePayer: owner,
      wallet: owner,
      tokenAccounts: sdkTokenAccounts,
      useSOLBalance: treatWalletSolAsPoolBalance,
    },
    ownerPosition: sdkClmmPositionInfo,
    computeBudgetConfig: txBudgetConfig,
    checkCreateATAOwner: true,
    amountMaxA: toSDKBN(amountA),
    amountMaxB: toSDKBN(amountB),
    makeTxVersion: sdkTxVersion,
    lookupTableCache: sdkLookupTableCache,
  }

  reportLog("[tx] clmm position increase txParams: ", toHumanReadable(txParams))
  const { innerTransactions } = await Clmm.makeIncreasePositionFromLiquidityInstructionSimple(txParams).catch((e) => {
    console.error(e)
    return { innerTransactions: [] }
  })
  assert(innerTransactions, "sdk compose innerTransactions failed, innerTransactions: " + innerTransactions)
  return Object.assign(innerTransactions, { connection, owner: params.owner, privateKey: params.privateKey })
}
