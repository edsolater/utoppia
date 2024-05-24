import { createCachedGlobalHook } from "@edsolater/pivkit"
import { createEffect, createMemo, createSignal, Setter } from "solid-js"
import { toPubString } from "../../utils/dataStructures/Publickey"
import { shuck_owner, shuck_walletAdapter, shuck_walletConnected } from "../data/store"
import { Token } from "../data/token/type"
import { connect } from "./methods/connect"
import { disconnect } from "./methods/disconnect"
import { initlyConnectPhantom } from "./methods/initlyConnectPhantom"
import { WalletAdapterInterface } from "./type"

export interface WalletStore {
  // for extract method
  $setters: {
    setHasInited: Setter<boolean>
    setConnected: Setter<boolean>
    setCurrentWallet: Setter<WalletAdapterInterface | undefined>
  }

  // data
  hasInited: boolean
  connected: boolean
  currentWallet?: WalletAdapterInterface
  owner?: string

  // methods
  connect(wallet: WalletAdapterInterface): Promise<void>
  disconnect(): Promise<void>
}

/**
 * token related type is in
 * {@link Token}
 */
export const useWalletStore = createCachedGlobalHook(() => {
  const [hasInited, setHasInited] = createSignal(false)
  const [connected, setConnected] = createSignal(false)
  const [currentWallet, setCurrentWallet] = createSignal<WalletAdapterInterface>()
  const owner = createMemo(() => toPubString(currentWallet()?.adapter.publicKey))
  createEffect(() => {
    const adapter = currentWallet()?.adapter
    shuck_walletAdapter.set(adapter)
    if (adapter) {
      adapter.on("connect", () => {
        shuck_walletConnected.set(true)
        setConnected(true)
      })
      adapter.on("disconnect", () => {
        shuck_walletConnected.set(false)
        setConnected(false)
      })
    } 
    shuck_owner.set(toPubString(adapter?.publicKey))
  })
  createEffect(initlyConnectPhantom)
  const store: WalletStore = {
    $setters: {
      setHasInited,
      setConnected,
      setCurrentWallet,
    },
    get hasInited() {
      return hasInited()
    },
    get connected() {
      return connected()
    },
    get currentWallet() {
      return currentWallet()
    },
    get owner() {
      return owner()
    },
    connect,
    disconnect,
  }
  return store
})
