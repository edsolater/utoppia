import { get, shrinkFn } from "@edsolater/fnkit"
import type { Tokenable } from "./type"
import { isToken } from "./utils"
import { type Token, type Tokens } from "./type"

export function getToken(input: Tokenable | undefined, tokens: Tokens | undefined): Token | undefined {
  if (!tokens) return undefined
  if (input == null) return undefined
  const mayMint = shrinkFn(input)
  if (isToken(mayMint)) return mayMint
  return get(tokens, mayMint)
}
