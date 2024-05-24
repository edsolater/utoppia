import {
  isArray, isNumberish, isPrimitive,
  map, toFormattedNumber, isObjectLiteral
} from "@edsolater/fnkit";
import { PublicKey } from "@solana/web3.js";
import { isSDKBN } from "../../../utils/dataStructures/BN";
import { toPubString } from "../../../utils/dataStructures/Publickey";

/** for debug easier and faster */
export function toHumanReadable(source: unknown, maxDepth = 10 /** to avoid too deep */) {
  if (!maxDepth) return source; // if no depth left (0 depth), just return
  if (isSDKBN(source)) return source.toString(10);
  if (isDate(source)) return source;
  if (isPrimitive(source)) return source;
  if (isPubKey(source)) return toPubString(source);
  if (isNumberish(source)) return toFormattedNumber(source);
  if (isArray(source) || isObjectLiteral(source)) return map(source, (v) => toHumanReadable(v, maxDepth - 1));

  return source;
}
function isDate(x: any): x is Date {
  return x instanceof Date;
}
function isPubKey(x: any): x is PublicKey {
  return x instanceof PublicKey;
}
