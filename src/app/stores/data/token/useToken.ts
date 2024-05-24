import { createStore } from "solid-js/store"
import { type Token } from "./type"
import { Tokenable } from "./type"
import { getTokenSubscribable } from "./getTokenSubscribable"

/**
 * use this in .tsx
 * easy to use & easy to read
 * turn a short info (only token'mint) into rich
 * whether loaded or not, it will return a token (even emptyToken)
 *
 * it use solidjs's createStore to store a object data
 */

export function useToken(input?: Tokenable): Token {
  const outputTokenSubscribable = getTokenSubscribable(input)
  const [outputToken, setOutputToken] = createStore<Token>(outputTokenSubscribable())
  outputTokenSubscribable.subscribe((newToken) => {
    if (newToken !== outputToken) {
      setOutputToken(newToken)
    }
  })
  return outputToken
}
