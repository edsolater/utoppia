/**************************************************************************
 *
 * @tags TxHandler misc
 *
 **************************************************************************/
import { add } from "@edsolater/fnkit"
import {
  BNDivCeil,
  type TransferAmountFee as SDK_TransferAmountFee,
  type CurrencyAmount as SDK_CurrencyAmount,
  type GetTransferAmountFee as SDK_GetTransferAmountFee,
  type TokenAmount as SDK_TokenAmount,
} from "@raydium-io/raydium-sdk"
import type { TransferFee, TransferFeeConfig } from "@solana/spl-token"
import type { EpochInfo } from "@solana/web3.js"
import BN from "bn.js"
import { isSDKBN, parseSDKBN, toSDKBN } from "../../../utils/dataStructures/BN"
import type { AmountBN } from "../../../utils/dataStructures/TokenAmount"

export interface TransferAmountFee {
  amountWithFeeBN: AmountBN
  feeBN: AmountBN | undefined
  expirationTime: number | undefined
}
const POINT = 10_000

export function parseSDKTransferAmountFee(
  transferAmountFee: SDK_GetTransferAmountFee | SDK_TransferAmountFee,
): TransferAmountFee {
  if (isSDKBN(transferAmountFee.amount) && (transferAmountFee.fee == null || isSDKBN(transferAmountFee.fee))) {
    return {
      amountWithFeeBN: parseSDKBN(transferAmountFee.amount),
      feeBN: transferAmountFee.fee && parseSDKBN(transferAmountFee.fee),
      expirationTime: transferAmountFee.expirationTime,
    }
  } else {
    const amount = transferAmountFee.amount as SDK_TokenAmount | SDK_CurrencyAmount
    const fee = transferAmountFee.fee as SDK_TokenAmount | SDK_CurrencyAmount | undefined

    return {
      amountWithFeeBN: parseSDKBN(amount.raw),
      feeBN: fee && parseSDKBN(fee.raw),
      expirationTime: transferAmountFee.expirationTime,
    }
  }
}
export function getTransferAmountFee(
  amount: AmountBN,
  feeConfig: TransferFeeConfig | undefined,
  epochInfo: EpochInfo,
  addFee: boolean,
): TransferAmountFee {
  if (feeConfig === undefined) {
    return {
      amountWithFeeBN: amount,
      feeBN: undefined,
      expirationTime: undefined,
    }
  }

  const amountSDKBN = toSDKBN(amount)
  const nowFeeConfig: TransferFee =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch ? feeConfig.olderTransferFee : feeConfig.newerTransferFee
  const maxFee = nowFeeConfig.maximumFee
  const expirationTime: number | undefined =
    epochInfo.epoch < feeConfig.newerTransferFee.epoch
      ? ((Number(feeConfig.newerTransferFee.epoch) * epochInfo.slotsInEpoch - epochInfo.absoluteSlot) * 400) / 1000
      : undefined

  if (addFee) {
    if (nowFeeConfig.transferFeeBasisPoints === POINT) {
      const nowMaxFee = nowFeeConfig.maximumFee
      return {
        amountWithFeeBN: add(amount, nowMaxFee),
        feeBN: nowMaxFee,
        expirationTime,
      }
    } else {
      const _TAmount = BNDivCeil(
        toSDKBN(amount).mul(new BN(POINT)),
        new BN(POINT - nowFeeConfig.transferFeeBasisPoints),
      )

      const nowMaxFee = new BN(nowFeeConfig.maximumFee.toString())
      const TAmount = _TAmount.sub(amountSDKBN).gt(nowMaxFee) ? amountSDKBN.add(nowMaxFee) : _TAmount

      const _fee = parseSDKBN(BNDivCeil(TAmount.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT)))
      const feeBN = _fee > maxFee ? maxFee : _fee
      return {
        amountWithFeeBN: parseSDKBN(TAmount),
        feeBN,
        expirationTime,
      }
    }
  } else {
    const _fee = parseSDKBN(BNDivCeil(amountSDKBN.mul(new BN(nowFeeConfig.transferFeeBasisPoints)), new BN(POINT)))
    const feeBN = _fee > maxFee ? maxFee : _fee

    return {
      amountWithFeeBN: amount,
      feeBN,
      expirationTime,
    }
  }
}
