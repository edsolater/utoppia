import { createEffect } from "solid-js"
import { Button, createDisclosure } from "@edsolater/pivkit"
import { useWalletStore } from "../stores/wallet/store"
import { getWalletAdapter } from "../stores/wallet/utils/getWalletAdapter"

/** this should be used in ./Navbar.tsx */
export function WalletWidget() {
  const walletStore = useWalletStore()

  const [isCopied, { close, open }] = createDisclosure()

  createEffect(() => {
    if (isCopied()) close()
  })

  return (
    <Button
      onClick={() =>
        walletStore.connected ? walletStore.disconnect() : walletStore.connect(getWalletAdapter("Phantom"))
      }
      // TODO: onHover : change text
      icss={{ width: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
    >
      {walletStore.connected ? `${walletStore.owner?.slice(0, 6)}...${walletStore.owner?.slice(-6)}` : "Connect Wallet"}
    </Button>
  )
}
