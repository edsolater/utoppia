import {
  GetTokenAccountsByOwnerConfig,
  SPL_ACCOUNT_LAYOUT,
  Spl,
  TokenAccount as _TokenAccount,
} from "@raydium-io/raydium-sdk"
import { Connection, type Commitment } from "@solana/web3.js"
import { parseSDKBN } from "./BN"
import { toPub, toPubString } from "./Publickey"
import { TOKEN_PROGRAM_ID } from "../../stores/data/token/utils"
import { getConnection } from "../../stores/data/connection/getConnection"
import { SOLMint } from "../../configs/wellKnownMints"
import type { Address, PublicKey } from "./type"
import { cache, listToRecord, type AnyFn, type Primitive } from "@edsolater/fnkit"
import { reportLog } from "../../stores/data/utils/logger"
import { createIDBStoreManager } from "../../../packages/cacheManager/storageManagers"
import { createIDBCachedFn } from "../../../packages/cacheManager/createCachedFn"
import { toStringKey } from "../../../packages/cacheManager/toStringKey"

/** is structure-clone-able */
export interface TokenAccount {
  programId: string
  isAssociated?: boolean // is ATA
  mint: string
  publicKey: string
  amount: bigint
  isNative: boolean // only SOL is true
}
export type SDK_TokenAccount = _TokenAccount

/**
 * Converts a TokenAccount to a SDK TokenAccount.
 * @param account The TokenAccount to convert.
 * @returns The converted _TokenAccount or undefined if the publicKey is null.
 */
export function toSDKTokenAccount(account: TokenAccount): _TokenAccount | undefined {
  return account.publicKey != null ? allSDKTokenAccountCache.get(account.publicKey)?.account : undefined
}

export function toUITokenAccount(account: _TokenAccount): TokenAccount | undefined {
  return allTokenAccountCache.get(toPubString(account.pubkey))?.account ?? undefined
}

/** store token account  */
const tokenAccountCacheByOwner = new Map<
  Address /* owner */,
  { tokenAccounts: Record<PublicKey, TokenAccount>; sdkTokenAccounts: _TokenAccount[] }
>()
const allTokenAccountCache = new Map<PublicKey /* tokenAccount pubkey */, { owner: Address; account: TokenAccount }>()
const allSDKTokenAccountCache = new Map<
  PublicKey /* tokenAccount pubkey */,
  { owner: Address; account: _TokenAccount }
>()

export function ownerHasStoredTokenAccounts({ owner }: { owner: string }) {
  return tokenAccountCacheByOwner.has(owner)
}

const tokenAccountStoreManager = createIDBStoreManager<{ owner: Address; account: TokenAccount }>({
  dbName: "tokenAccount",
})

// same as `connection.getAccountInfo`
function createCachedGetAccountInfoFnByConnection() {
  const originalFn = (connection: Connection, owner: string, commitment?: Commitment) =>
    connection.getAccountInfo(toPub(owner), commitment)

  return createIDBCachedFn(originalFn, {
    dbName: "tokenAccount_test",
    toCacheKey: (_, owner) => owner,
    toDBValue: (value) => value.then((v) => v?.data),
  })
}
// same as `connection.getAccountInfo`
function foo() {
  const originalFn = (options: { name: { say: string } }) => {
    console.log("run originalFn")
    return options.name
  }
  return createIDBCachedFn(originalFn, {
    dbName: "foo_test",
  })
}
const cachedFoo = foo()

console.time("r1")
const r1Promise = cachedFoo({ name: { say: "hello" } })
const r2Promise = cachedFoo({ name: { say: "hello" } })
Promise.all([r1Promise, r2Promise]).then(([r1, r2]) => {
  console.log("r1: ", r1)
  console.log("r2: ", r2)
  console.log(r1 === r2)
})
console.timeEnd("r1")

/**
 * core logic
 * just relay on connection
 */
export async function getTokenAccounts({
  canUseCache = true,
  connection: c,
  owner,
  config,
}: {
  canUseCache?: boolean
  connection: Connection | string
  owner: string
  config?: GetTokenAccountsByOwnerConfig
}): Promise<{ tokenAccounts: Record<PublicKey, TokenAccount>; sdkTokenAccounts: _TokenAccount[] }> {
  const connection = getConnection(c)
  if (canUseCache && ownerHasStoredTokenAccounts({ owner })) {
    return tokenAccountCacheByOwner.get(owner)!
  } else {
    reportLog("[⚙️worker] start loading token accounts", owner)
    const solReqPromise = connection.getAccountInfo(toPub(owner), config?.commitment)
    const ownerTokensReqPromise = connection.getTokenAccountsByOwner(
      toPub(owner),
      { programId: toPub(TOKEN_PROGRAM_ID) },
      config?.commitment,
    )

    const [solRes, ownerTokensRes] = await Promise.all([solReqPromise, ownerTokensReqPromise])

    console.log("solRes: ", solRes)
    console.log("ownerTokensRes: ", ownerTokensRes)
    const tokenAccounts: TokenAccount[] = []
    const sdkTokenAccounts: _TokenAccount[] = []

    for (const { pubkey, account } of ownerTokensRes.value) {
      // double check layout length
      if (account.data.length !== SPL_ACCOUNT_LAYOUT.span) {
        console.error("invalid token account layout length", "publicKey",toPubString(pubkey))
        break
      }

      const rawResult = SPL_ACCOUNT_LAYOUT.decode(account.data)
      const { mint, amount } = rawResult

      //TODO: should cache
      const associatedTokenAddress = Spl.getAssociatedTokenAccount({
        mint,
        owner: toPub(owner),
        programId: account.owner,
      })

      tokenAccounts.push({
        programId: account.owner.toBase58(),
        publicKey: toPubString(pubkey),
        mint: toPubString(mint),
        isAssociated: associatedTokenAddress.equals(pubkey),
        amount: parseSDKBN(amount),
        isNative: false,
      })
      sdkTokenAccounts.push({ pubkey, accountInfo: rawResult, programId: account.owner })
    }

    tokenAccounts.push({
      programId: TOKEN_PROGRAM_ID,
      amount: BigInt(solRes ? solRes.lamports : 0),
      mint: SOLMint,
      publicKey: owner,
      isNative: true,
    })

    // set cache
    tokenAccounts.forEach(
      (account) => account.publicKey && allTokenAccountCache.set(account.publicKey, { owner, account }),
    )
    sdkTokenAccounts.forEach((account) => allSDKTokenAccountCache.set(account.pubkey.toString(), { owner, account }))
    tokenAccountCacheByOwner.set(owner, {
      tokenAccounts: listToRecord(tokenAccounts, (i) => i.publicKey),
      sdkTokenAccounts,
    })

    return { tokenAccounts: listToRecord(tokenAccounts, (i) => i.publicKey), sdkTokenAccounts }
  }
}
