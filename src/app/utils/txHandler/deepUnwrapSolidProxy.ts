import { isObjectLiteral, map } from "@edsolater/fnkit"
import { unwrap } from "solid-js/store"

/** solidjs utils */
export function deepUnwrapSolidProxy<T>(data: T): T {
  if (isObjectLiteral(data)) {
    return map(data, (v) => deepUnwrapSolidProxy(v)) as T
  } else {
    return unwrap(data)
  }
}
