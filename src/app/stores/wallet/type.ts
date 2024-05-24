import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets"

export type WalletAdapters = PhantomWalletAdapter | TrustWalletAdapter | SolflareWalletAdapter | LedgerWalletAdapter

export interface WalletAdapterInterface {
  adapter: WalletAdapters
}

export type WalletsNames = "Phantom" | "Trust" | "Solflare" | "Ledger"
