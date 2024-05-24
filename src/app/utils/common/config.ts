import { map } from "@edsolater/fnkit"
import { MAINNET_PROGRAM_ID, RAYDIUM_MAINNET } from "@raydium-io/raydium-sdk"
// import { ENDPOINT, MAINNET_PROGRAM_ID, RAYDIUM_MAINNET } from '@raydium-io/raydium-sdk'
import { toPubString } from "../dataStructures/Publickey"

const apiTailUrls = RAYDIUM_MAINNET
const apiBase = "https://uapi.raydium.io"
const programIds = MAINNET_PROGRAM_ID

export const appApiUrls = map(apiTailUrls, (url) => apiBase + url) as {
  [key in keyof typeof apiTailUrls]: `${typeof apiBase}${(typeof apiTailUrls)[key]}`
}
export const appProgramId = map(programIds, (p) => toPubString(p))
