import { createTimeoutMap, shakeNil } from "@edsolater/fnkit"
import { fetchMultipleMintInfos, type ReturnTypeFetchMultipleMintInfo } from "@raydium-io/raydium-sdk"
import { getConnection } from "./getConnection"
import { toPub } from "../../../utils/dataStructures/Publickey"
import type { Mint } from "../../../utils/dataStructures/type"

// cache for 10 mins
const mintInfoCache = createTimeoutMap<string, Promise<ReturnTypeFetchMultipleMintInfo>>({
  maxAgeMs: 10 * 60 * 1000,
})

export async function getMultiMintInfos(
  mints: Mint[],
  payload: {
    rpcUrl: string
  },
): Promise<Record<Mint, ReturnTypeFetchMultipleMintInfo>> {
  const connection = getConnection(payload.rpcUrl)
  if (!connection) return Promise.reject("connection is not ready")
  const allMints = [mints].flat()

  const alreadyCachedInfos = Object.fromEntries(
    shakeNil(allMints.map((m) => (mintInfoCache.has(m) ? [m, mintInfoCache.get(m)!] : undefined))),
  )
  const needCheckMints = allMints.filter((m) => !mintInfoCache.has(m))

  if (needCheckMints.length !== 0) {
    const infos = fetchMultipleMintInfos({ connection, mints: allMints.map((i) => toPub(i)) })
    needCheckMints.forEach((needCheckMint) => {
      mintInfoCache.set(
        needCheckMint,
        infos.then((i) => i[needCheckMint]),
      )
    })
    return Promise.all([infos, awaitAllObjectValue(alreadyCachedInfos)]).then(([infos, alreadyCachedInfos]) => ({
      ...alreadyCachedInfos,
      ...infos,
    }))
  } else {
    return awaitAllObjectValue(alreadyCachedInfos)
  }
}

/**
 * { a: Promise<'hello'>, b: Promise<'world'>} => Promise<{a: 'hello', b: 'world'}>
 * @todo move to fnkit; rename to `awaitAll`
 */
function awaitAllObjectValue<T extends Record<string, any>>(o: T): Record<keyof T, Awaited<T[keyof T]>> {
  return Promise.all(Object.values(o)).then((values) => {
    const result = {}
    for (const [idx, key] of Object.keys(o).entries()) {
      const v = values[idx]
      result[key] = v
    }
    return result
  }) as any
}
