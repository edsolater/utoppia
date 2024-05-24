import { isArray, isObjectLiteral, isPrimitive, map } from "@edsolater/fnkit"
import { FlatSDKBN, isSDKBN, parseSDKBN } from "../dataStructures/BN"
import { FlatSDKDecimal, isSDKDecimal, parseSDKDecimal } from "../dataStructures/Decimal"
import { FlatSDKFraction, isSDKFraction, parseSDKFraction } from "../dataStructures/Fraction"
import { FlatSDKPrice, isSDKPrice, parseSDKPrice } from "../dataStructures/Price"
import { isPublicKey, toPubString } from "../dataStructures/Publickey"
import { FlatSDKToken, isSDKToken, parseSDKToken } from "../../stores/data/token/utils"
import { FlatSDKTokenAmount, isSDKTokenAmount, parseSDKTokenAmount } from "../dataStructures/TokenAmount"

/**
 *
 * @param sdkRawData input raw sdk data
 */
export function flatSDKReturnedInfo<T>(
  sdkRawData: T,
): FlatSDKFraction<FlatSDKBN<FlatSDKPrice<FlatSDKDecimal<FlatSDKToken<FlatSDKTokenAmount<T>>>>>> {
  if (isPrimitive(sdkRawData)) {
    return sdkRawData as any
  } else if (isArray(sdkRawData)) {
    return sdkRawData.map(flatSDKReturnedInfo) as any
  } else if (isSDKTokenAmount(sdkRawData)) {
    return parseSDKTokenAmount(sdkRawData) as any
  } else if (isSDKToken(sdkRawData)) {
    return parseSDKToken(sdkRawData) as any
  } else if (isPublicKey(sdkRawData)) {
    return toPubString(sdkRawData) as any
  } else if (isSDKBN(sdkRawData)) {
    return parseSDKBN(sdkRawData) as any
  } else if (isSDKDecimal(sdkRawData)) {
    return parseSDKDecimal(sdkRawData) as any
  } else if (isSDKPrice(sdkRawData)) {
    return parseSDKPrice(sdkRawData) as any
  } else if (isSDKFraction(sdkRawData)) {
    return parseSDKFraction(sdkRawData) as any
  } else if (isObjectLiteral(sdkRawData)) {
    return map(sdkRawData, (v) => flatSDKReturnedInfo(v)) as any
  }

  return sdkRawData as any
}
