import { createEventCenter, isArray, isString, shakeNil, type IDNumber } from "@edsolater/fnkit"
import { TxClmmPositionDecreaseConfig } from "../../stores/data/txClmmPositionDecrease"
import { TxClmmPositionIncreaseConfig } from "../../stores/data/txClmmPositionIncrease"
import { TxSwapConfig } from "../../stores/data/txSwap"
import { getMessagePort } from "../webworker/loadWorker_main"
import type { TxErrorInfo, TxHandlerEventCenter, TxSendErrorInfo, TxSendSuccessInfo, TxSuccessInfo } from "./txHandler"

export type TxResponse =
  | { messageId: IDNumber; name: string; txStatus: "txSuccess"; txInfo: TxSuccessInfo }
  | { messageId: IDNumber; name: string; txStatus: "txError"; txInfo: TxErrorInfo }
  | { messageId: IDNumber; name: string; txStatus: "txSendSuccess"; txInfo: TxSendSuccessInfo }
  | { messageId: IDNumber; name: string; txStatus: "txSendError"; txInfo: TxSendErrorInfo }

export type TxBuilderSingleConfig = TxSwapConfig | TxClmmPositionIncreaseConfig | TxClmmPositionDecreaseConfig
export type TxBuilderConfigs = { messageId: IDNumber; config: TxBuilderSingleConfig | TxBuilderSingleConfig[] }

//make different tx action can correspond to different tx event center
let txLaunchIdid = 0
function getTxLaunchId(): IDNumber {
  return txLaunchIdid++
}

export function launchTx(config: TxBuilderSingleConfig | TxBuilderSingleConfig[]): TxHandlerEventCenter {
  const thisActionMessageId = getTxLaunchId()
  const port = getMessagePort<TxResponse>("tx start")
  port.postMessage({ messageId: thisActionMessageId, config } satisfies TxBuilderConfigs)
  const txEventCenter = createEventCenter() as unknown as TxHandlerEventCenter // TODO: should destory it? 🤔
  port.receiveMessage(({ messageId, name: txName, txStatus, txInfo }) => {
    if (thisActionMessageId !== messageId) return // not self tx message
    txEventCenter.emit(txStatus, [txInfo] as any)
  })
  return txEventCenter
}

export function invokeTxConfig(...configs: (TxBuilderSingleConfig | undefined)[]): TxHandlerEventCenter | undefined {
  if (!configs.length) return undefined
  const validConfigs = shakeNil(configs)
  if (!validConfigs.length) return undefined
  return launchTx(validConfigs)
}

function isTxConfig(config: any): config is TxBuilderSingleConfig {
  return isArray(config) && config.length <= 2 && isString(config[0])
}
