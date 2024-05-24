import { assert, eq, Numberish } from "@edsolater/fnkit"
import { TradeV2 } from "@raydium-io/raydium-sdk"
import { appProgramId } from "../../utils/common/config"
import { getConnection } from "./connection/getConnection"
import { toPub } from "../../utils/dataStructures/Publickey"
import { getTxHandlerUtils, type UITxVersion } from "../../utils/txHandler"
import { handleTxModule, type TransactionModule } from "../../utils/txHandler/handleTxFromShortcut"
import { getRealSDKTxVersion } from "../../utils/txHandler/txVersion"
import { Token } from "./token/type"
import { getBestCalcResultCache } from "./utils/calculateSwapRouteInfos"

export type TxSwapConfig = { name: "swap"; params: TxSwapParams }

export interface TxSwapParams {
  owner: string
  checkInfo: {
    rpcURL: string
    coin1: Token
    coin2: Token
    amount1: Numberish
    // amount2: Numberish
    direction: "1 → 2" | "2 → 1"
  }
  txVersion?: UITxVersion
}

export async function txSwap(txParams: TxSwapParams) {
  return handleTxModule(await createTxSwapTransactionModule(txParams))
}

export async function createTxSwapTransactionModule(txParams: TxSwapParams): Promise<TransactionModule> {
  const connection = getConnection(txParams.checkInfo.rpcURL)
  const neariestSwapBestResultCache = getBestCalcResultCache()
  assert(neariestSwapBestResultCache, "swapInfo not found")
  assert(neariestSwapBestResultCache.params.input.mint === txParams.checkInfo.coin1.mint, "coin1 is not match")
  assert(neariestSwapBestResultCache.params.output.mint === txParams.checkInfo.coin2.mint, "coin2 is not match")
  assert(
    eq(neariestSwapBestResultCache.params.inputAmount.amount, txParams.checkInfo.amount1),
    "inputAmount is not match",
  )

  const { owner, getSDKBudgetConfig, getSDKTokenAccounts, sdkTxVersion, sdkLookupTableCache } = getTxHandlerUtils({
    rpcUrl: txParams.checkInfo.rpcURL,
    owner: txParams.owner,
  })
  const [txBudgetConfig, sdkTokenAccounts] = await Promise.all([getSDKBudgetConfig(), getSDKTokenAccounts()])
  assert(sdkTokenAccounts, "token account can't load")
  // const { sdkTokenAccounts } = await getTokenAccounts({ connection, owner: toPubString(owner) })
  console.log(3)
  const { innerTransactions } = await TradeV2.makeSwapInstructionSimple({
    connection,
    swapInfo: neariestSwapBestResultCache.sdkBestResult,
    ownerInfo: {
      wallet: owner,
      tokenAccounts: sdkTokenAccounts,
      associatedOnly: true,
      checkCreateATAOwner: true,
    },
    routeProgram: toPub(appProgramId.Router),
    makeTxVersion: getRealSDKTxVersion(txParams.txVersion),
    computeBudgetConfig: txBudgetConfig,
  })
  console.log("innerTransactions: ", innerTransactions)
  return Object.assign(innerTransactions, { connection, owner: txParams.owner })
}
