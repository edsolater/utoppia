import { getType, hasProperty, isObject, toBigint } from "@edsolater/fnkit"
import {
  MessageAddressTableLookup,
  MessageV0,
  PublicKey,
  VersionedTransaction
} from "@solana/web3.js"
import BN from "bn.js"
import { parseSDKBN } from "../dataStructures/BN"
import { toPub, toPubString } from "../dataStructures/Publickey"
import { TransmitRule } from "./type"

function encodeBN(rawData: BN) {
  return toBigint(parseSDKBN(rawData))
}

function encodePublicKey(rawData: PublicKey) {
  return toPubString(rawData)
}

function encodeTransaction(transaction: VersionedTransaction) {
  console.log("transaction: ", transaction)
  return {
    message: encodeMessage(transaction.message as MessageV0 /* TODO: support Message and MessageV0 */),
    signatures: transaction.signatures,
  }
}

function encodeMessage(message: MessageV0) {
  return {
    header: message.header,
    staticAccountKeys: message.staticAccountKeys.map(encodePublicKey),
    recentBlockhash: message.recentBlockhash,
    compiledInstructions: message.compiledInstructions,
    addressTableLookups: message.addressTableLookups.map(encodeMessageAddressTableLookup),
  }
}
function decodeMessage(rawData: ReturnType<typeof encodeMessage>) {
  return new MessageV0({
    header: rawData.header,
    staticAccountKeys: rawData.staticAccountKeys.map((key) => toPub(key)),
    recentBlockhash: rawData.recentBlockhash,
    compiledInstructions: rawData.compiledInstructions,
    addressTableLookups: rawData.addressTableLookups.map(decodeMessageAddressTableLookup),
  })
}

function encodeMessageAddressTableLookup(messageAddressTableLookup: MessageAddressTableLookup) {
  return {
    accountKey: encodePublicKey(messageAddressTableLookup.accountKey),
    writableIndexes: messageAddressTableLookup.writableIndexes,
    readonlyIndexes: messageAddressTableLookup.readonlyIndexes,
  }
}
function decodeMessageAddressTableLookup(rawData: ReturnType<typeof encodeMessageAddressTableLookup>) {
  return {
    accountKey: toPub(rawData.accountKey),
    writableIndexes: rawData.writableIndexes,
    readonlyIndexes: rawData.readonlyIndexes,
  }
}

function encodeVersionedTransaction(rawData: VersionedTransaction) {
  return { _type: "encoded VersionedTransaction", _info: encodeTransaction(rawData) }
}

function decodeVersionedTransaction(rawData: ReturnType<typeof encodeVersionedTransaction>) {
  const message = decodeMessage(rawData._info.message)
  const signatures = rawData._info.signatures
  return new VersionedTransaction(message, signatures)
}

const BNRule: TransmitRule = {
  canEncode: (data) =>
    isObject(data) && (data instanceof BN || (getType(data) as string) === "BN" || data.constructor === BN),
  encode: encodeBN,
}

const PublickeyRule: TransmitRule = {
  canEncode: (data) =>
    isObject(data) &&
    (data instanceof PublicKey || (getType(data) as string).startsWith("PublicKey") || data.constructor === PublicKey),
  encode: encodePublicKey,
}

const VersionedTransactionRule: TransmitRule = {
  canEncode: (data) =>
    isObject(data) &&
    (data instanceof VersionedTransaction ||
      (getType(data) as string) === "VersionedTransaction" ||
      data.constructor === VersionedTransaction ||
      (hasProperty(data, "message") && hasProperty(data, "signatures"))),
  encode: encodeVersionedTransaction,
  canDecode: (data) =>
    isObject(data) && "_type" in data && "_info" in data && data._type === "encoded VersionedTransaction",
  decode: decodeVersionedTransaction,
}

export const rules = [VersionedTransactionRule, BNRule, PublickeyRule]
