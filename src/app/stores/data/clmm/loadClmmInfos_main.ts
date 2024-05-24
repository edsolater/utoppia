import { getFirstItem } from "@edsolater/fnkit"
import { createTask } from "../../../../packages/conveyor/smartStore/task"
import { getMessagePort } from "../../../utils/webworker/loadWorker_main"
import { shuck_clmmInfos, shuck_isClmmJsonInfoLoading, shuck_owner, shuck_rpc } from "../store"
import type { ClmmInfos } from "../types/clmm"
import { reportLog } from "../utils/logger"

type ClmmQueryBaseOptions = {
  rpcUrl: string
  owner?: string

  // when set this, means only refetch sdk info
  onlyClmmId?: string[]
}

export type ClmmQueryParams = ClmmQueryBaseOptions & ClmmQueryCacheOptions

export type ClmmQueryCacheOptions = {
  /** @default true */
  shouldApi?: boolean

  /** @default true */
  shouldApiCache?: boolean

  /** @default true */
  shouldSDK?: boolean

  /** @default true */
  shouldSDKCache?: boolean

  /** @default true */
  shouldTokenAccountCache?: boolean
}

export function loadClmmInfos() {
  registerClmmInfosReceiver()
  const taskManager = createTask(
    [shuck_rpc, shuck_owner],
    () => {
      refreshClmmInfos()
    },
    { visiable: true },
  )
  return taskManager
}

/** can use this action isolatly */
export function refreshClmmInfos(options?: Omit<ClmmQueryParams, "rpcUrl" | "owner">) {
  const port = getMessagePort<ClmmInfos, ClmmQueryParams>("fetch raydium clmm info")
  const url = shuck_rpc()?.url
  const owner = shuck_owner()
  if (!url) return
  console.count("[🤖main] refresh clmm infos")
  shuck_isClmmJsonInfoLoading.set(true)
  port.postMessage({
    onlyClmmId: options?.onlyClmmId,
    shouldApi: options?.shouldApi ?? true,
    shouldApiCache: options?.shouldApiCache ?? true,
    shouldSDK: options?.shouldSDK ?? true,
    shouldSDKCache: options?.shouldSDKCache ?? true,
    shouldTokenAccountCache: options?.shouldTokenAccountCache ?? true,
    rpcUrl: url,
    owner,
  })
}

export function registerClmmInfosReceiver() {
  const port = getMessagePort<ClmmInfos, ClmmQueryParams>("fetch raydium clmm info")
  reportLog("[🤖main] register clmm infos receiver")
  port.receiveMessage(
    (infos) => {
      shuck_isClmmJsonInfoLoading.set(false)

      setTimeout(() => {
        console.log(
          `[🤖main] clmm ${getFirstItem(infos) && "liquidity" in getFirstItem(infos) ? "SDK" : "API"} infos: `,
          infos,
        )
        shuck_clmmInfos.set((o) => ({ ...o, ...infos }))
      })
    },
    { key: "[🤖main] receive clmm infos" },
  )
}
