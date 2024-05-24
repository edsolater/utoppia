import { isUndefined } from "@edsolater/fnkit"

/**
 * Checks if two strings are equal in a case-insensitive manner.
 *
 * @param s1 The first string to compare.
 * @param s2 The second string to compare.
 * @returns A boolean indicating whether the two strings are equal in a case-insensitive manner.
 * @example
 * isStringInsensitivelyEqual('Hello World', 'hello world'); // true
 * isStringInsensitivelyEqual('Hello World', 'world'); // false
 */
export function isStringInsensitivelyEqual(s1: string | undefined, s2: string | undefined) {
  if (isUndefined(s1) || isUndefined(s2)) return false
  return s1.toLowerCase() === s2.toLowerCase()
}
/**
 * Checks if a string is contained within another string in a case-insensitive manner.
 *
 * @param s1 The string to check if it contains the other string.
 * @param s2 The string to check if it is contained within the other string.
 * @returns A boolean indicating whether the second string is contained within the first string in a case-insensitive manner.
 * @example
 * isStringInsensitivelyContain('Hello World', 'hello'); // true
 * isStringInsensitivelyContain('Hello World', 'hello world'); // true
 */
export function isStringInsensitivelyContain(s1: string | undefined, s2: string | undefined) {
  if (isUndefined(s1) || isUndefined(s2)) return false
  return s1.toLowerCase().includes(s2.toLowerCase())
}
