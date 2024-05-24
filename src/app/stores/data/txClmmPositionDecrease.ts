/**************************************************************************
 *
 * @tags CLMM tx
 * ActionLabel = "clmm position decrease"
 *
 **************************************************************************/

import { assert, isPositive, minus, type Percent } from "@edsolater/fnkit"
import { Clmm } from "@raydium-io/raydium-sdk"
import { toSDKBN } from "../../utils/dataStructures/BN"
import { getConnection } from "./connection/getConnection"
import { toPubString } from "../../utils/dataStructures/Publickey"
import type { Amount } from "../../utils/dataStructures/TokenAmount"
import { getTxHandlerUtils, type TxParams } from "../../utils/txHandler"
import { handleTxModule, type TransactionModule } from "../../utils/txHandler/handleTxFromShortcut"
import { getClmmDecreaseTxLiquidityAndBoundaryFromAmount } from "./clmm/getClmmTxLiquidityAndBoundaryFromAmount"
import { isTokenSOLWSOL } from "./token/utils"
import { jsonClmmInfoCache } from "./clmm/fetchClmmJson"
import { sdkClmmInfoCache } from "./utils/sdkParseClmmInfos"
import { toHumanReadable } from "./utils/toHumanReadable"
import { reportLog } from "./utils/logger"

export type TxClmmPositionDecreaseConfig = { name: "clmm position decrease"; params: TxClmmPositionDecreaseParams }

export type TxClmmPositionDecreaseParams = TxParams<{
  rpcUrl: string
  owner: string
  clmmId: string
  positionNftMint: string
  slippage?: Percent // e.g. 0.01

  amountA?: Amount
  amountB?: Amount
}>

/** need amountA or amountB */
export async function txClmmPositionDecrease(params: TxClmmPositionDecreaseParams) {
  return handleTxModule(await createTxClmmPositionDecreaseTransactionModule(params))
}

/** need amountA or amountB */
export async function createTxClmmPositionDecreaseTransactionModule(
  params: TxClmmPositionDecreaseParams,
): Promise<TransactionModule> {
  const amount = "amountA" in params ? params.amountA : params.amountB
  const amountSide = "amountA" in params ? "A" : "B"
  console.log("amountSide: ", amountSide)
  reportLog("[worker tx core algorithm] start compose tx clmm position decrease")
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
  const txBudgetConfigPromise = getSDKBudgetConfig()
  const sdkTokenAccountsPromise = getSDKTokenAccounts()

  const infoPromise = getClmmDecreaseTxLiquidityAndBoundaryFromAmount({
    amount,
    rpcUrl: params.rpcUrl,
    clmmId: params.clmmId,
    positionNftMint: params.positionNftMint,
    amountSide,
  })
  const [txBudgetConfig, sdkTokenAccounts, info] = await Promise.all([
    txBudgetConfigPromise,
    sdkTokenAccountsPromise,
    infoPromise,
  ])

  assert(info, `${getClmmDecreaseTxLiquidityAndBoundaryFromAmount.name} fail to work`)
  const { liquidity, amountAInfo, amountBInfo } = info
  const { amountWithFeeBN: amountA, feeBN: feeA } = amountAInfo
  const { amountWithFeeBN: amountB, feeBN: feeB } = amountBInfo

  assert(txBudgetConfig, "txBudgetConfig can't load")
  assert(sdkTokenAccounts, "token account can't load")
  const treatWalletSolAsPoolBalance = isTokenSOLWSOL(jsonClmmInfo.mintA) || isTokenSOLWSOL(jsonClmmInfo.mintB)
  const txParams = {
    connection,
    liquidity: toSDKBN(liquidity),
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
    amountMinA: toSDKBN(feeA ? minus(amountA, feeA) : amountA),
    amountMinB: toSDKBN(feeB ? minus(amountB, feeB) : amountB),
    makeTxVersion: sdkTxVersion,
    lookupTableCache: sdkLookupTableCache,
  }
  reportLog("[tx] clmm position decrease txParams: ", toHumanReadable(txParams))
  const { innerTransactions } = await Clmm.makeDecreaseLiquidityInstructionSimple(txParams).catch((e) => {
    console.error(e)
    return { innerTransactions: [] }
  })
  assert(innerTransactions, "sdk compose innerTransactions failed, innerTransactions: " + innerTransactions)
  return Object.assign(innerTransactions, { connection, owner: params.owner, privateKey: params.privateKey })
}
