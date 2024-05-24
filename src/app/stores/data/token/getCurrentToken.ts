import { type Token } from "./type"
import { getTokenSubscribable } from "./getTokenSubscribable"
import { Tokenable } from "./type"

/** not reactable!! use this in .tsx|.ts  */

export function getCurrentToken(input?: Tokenable): Token | undefined {
  const outputTokenSubscribable = getTokenSubscribable(input)
  return outputTokenSubscribable()
}
