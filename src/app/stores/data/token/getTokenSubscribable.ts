import { get, isString, shrinkFn, type Subscribable } from "@edsolater/fnkit"
import { shuck_isTokenListLoading, shuck_isTokenListLoadingError, shuck_tokens } from "../store"
import { Tokenable, type Token } from "./type"
import { defaultToken, errorToken, loadingToken } from "./utils"

/**
 * use this in .ts
 */

export function getTokenSubscribable(input?: Tokenable): Subscribable<Token> {
  const inputToken = shuck_tokens.pipe((tokens) => {
    const inputParam = shrinkFn(input)
    if (isString(inputParam)) {
      const mint = inputParam
      return get(tokens, mint)
    } else {
      const token = inputParam
      return token
    }
  })

  const outputToken = inputToken.pipe((newToken) => newToken ?? defaultToken())
  function updateToken() {
    const newToken = inputToken()
    if (newToken) {
      if (newToken !== outputToken()) {
        outputToken.set(newToken)
      }
    } else if (shuck_isTokenListLoading()) {
      outputToken.set(loadingToken)
    } else if (shuck_isTokenListLoadingError()) {
      outputToken.set(errorToken)
    }
  }
  inputToken.subscribe(updateToken)
  shuck_isTokenListLoading.subscribe(updateToken)
  shuck_isTokenListLoadingError.subscribe(updateToken)

  return outputToken
}
