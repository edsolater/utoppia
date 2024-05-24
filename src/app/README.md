# UI components ([components](components))

# Data block moudles ([stores](stores))

## farms

- [type](stores/farms/type.ts)
- [[utils] fetchFarmAprJson](stores/farms/fetchFarmAprJson.ts)
- [[utils] fetchFarmJson](stores/farms/fetchFarmJson.ts)
- [store](stores/farms/store.ts)
- [webWorker](stores/farms/webworker.ts)

## tokens

- [type](./stores/tokens/type.ts)
- [[utils] fetchTokenJsonInfo](stores/tokens/fetchTokenJsonInfo.ts)
- [[store-utils] initAllTokens](stores/tokens/initAllTokens.ts)
- [store](stores/tokens/store.ts)
- [webworker](stores/tokens/webworker.ts)

## pairs

- [type](stores/pairs/type.ts)
- [[utils] fetchPairJsonInfos](stores/pairs/fetchPairJsonInfos.ts)
- [store](stores/pairs/store.ts)
- [webworker](stores/pairs/webworker.ts)

## wallet

- [type](stores/wallet/type.ts)
- [[config] supportedWallets](stores/wallet/supportedWallets.ts)
- [[util] autoConnectWallet](stores/wallet/autoConnectWallet.ts)
- [[util] findWalletAdapter](stores/wallet/findWalletAdapter.ts)
- [[store-util] initWalletAccess](stores/wallet/initWalletAccess.ts)
- [store](stores/wallet/store.ts)

# Templates for easy ctrl-C/V ([template](template))

only props:icss props:variant props:style props:class are for component style