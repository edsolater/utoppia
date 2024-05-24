import { createSubscribable, filter, toList } from "@edsolater/fnkit"
import { getTokenAccounts } from "../../../utils/dataStructures/TokenAccount"
import { PortUtils } from "../../../utils/webworker/createMessagePortTransforers"
import { getConnection } from "../connection/getConnection"
import { workerThreadWalletInfo } from "../store_worker"
import { sdkParseClmmInfos } from "../utils/sdkParseClmmInfos"
import { hydrateClmmInfos } from "./hydrateClmmInfo"
import { fetchClmmJsonInfo } from "./fetchClmmJson"
import type { ClmmQueryParams } from "./loadClmmInfos_main"
import { reportLog } from "../utils/logger"
import type { ClmmInfos } from "../types/clmm"

const workerCache_clmmInfos = createSubscribable<ClmmInfos>()

export function loadClmmInfosInWorker({ getMessagePort }: PortUtils<ClmmQueryParams, ClmmInfos>) {
  reportLog("[⚙️worker] start loading clmm infos")
  const port = getMessagePort("fetch raydium clmm info")
  port.receiveMessage(
    ({ owner, rpcUrl, shouldApi, shouldApiCache, shouldSDK, shouldSDKCache, shouldTokenAccountCache, onlyClmmId }) => {
      workerThreadWalletInfo.owner = owner
      workerThreadWalletInfo.rpcUrl = rpcUrl
      const ownerTokenAccounts = owner
        ? getTokenAccounts({ canUseCache: shouldTokenAccountCache, owner: owner, connection: rpcUrl })
        : undefined

      const apiClmmInfos = fetchClmmJsonInfo(Boolean(onlyClmmId || shouldApiCache)).then((infos) =>
        onlyClmmId ? filter(infos, (_, k) => onlyClmmId.includes(k)) : infos,
      )

      if (!onlyClmmId && shouldApi) {
        apiClmmInfos
          .then(log("[⚙️worker] clmm API Infos"))
          .then((apiClmmInfos) => hydrateClmmInfos({ apiInfo: apiClmmInfos }))
          .then(
            applyAction((clmmInfos) => {
              workerCache_clmmInfos.set(clmmInfos)
            }),
          )
          .then(port.postMessage)
          .catch(logError)
      }

      if (onlyClmmId || shouldSDK) {
        const sdkClmmInfos = Promise.all([apiClmmInfos, ownerTokenAccounts]).then(
          ([infos, ownerInfo]) =>
            infos &&
            sdkParseClmmInfos({
              shouldUseCache: shouldSDKCache,
              connection: getConnection(rpcUrl),
              apiClmmInfos: infos,
              ownerInfo:
                ownerInfo && owner
                  ? {
                      owner: owner,
                      tokenAccounts: ownerInfo.sdkTokenAccounts,
                    }
                  : undefined,
            }),
        )

        Promise.all([apiClmmInfos, sdkClmmInfos])
          .then(log("[⚙️worker] start compose clmmInfos"))
          .then(([apiClmmInfos, sdkClmmInfos]) => hydrateClmmInfos({ apiInfo: apiClmmInfos, sdkInfo: sdkClmmInfos }))
          .then(
            applyAction((clmmInfos) => {
              workerCache_clmmInfos.set(clmmInfos)
            }),
          )
          .then(port.postMessage)
          .catch(logError)
      }
    },
  )
}

function applyAction<T>(action: (data: T) => void) {
  return (data: T) => {
    action(data)
    return data
  }
}
/**
 * a promise middleware
 * @param label log in first line
 * @returns a function to used in promise.then
 */
export function log(label?: string) {
  return (data: any) => {
    console.log(label, data)
    return data
  }
}

/**
 * a promise middleware
 * used for promise .catch
 */
export function logError(error?: unknown) {
  console.warn(error)
  return undefined
}
