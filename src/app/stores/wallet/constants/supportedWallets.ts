import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TrustWalletAdapter,
} from "@solana/wallet-adapter-wallets"
import { WalletAdapterInterface } from "../type"

export const supportedWallets: WalletAdapterInterface[] = [
  { adapter: new PhantomWalletAdapter() },
  { adapter: new TrustWalletAdapter() },
  { adapter: new SolflareWalletAdapter() },
  { adapter: new LedgerWalletAdapter() },
]
