/** should connection is a subscribable */
// export function useWalletAccountChangeListeners() {
//   const connection = useConnection((s) => s.connection)
//   const owner = useWallet((s) => s.owner)
//   useEffect(() => {
//     if (!connection || !owner) return
//     const listenerId = connection.onAccountChange(
//       new PublicKey(owner),
//       () => {
//         invokeWalletAccountChangeListeners("confirmed")
//       },
//       "confirmed",
//     )
//     const listenerId2 = connection.onAccountChange(
//       new PublicKey(owner),
//       () => {
//         invokeWalletAccountChangeListeners("finalized")
//       },
//       "finalized",
//     )
//     return () => {
//       connection.removeAccountChangeListener(listenerId)
//       connection.removeAccountChangeListener(listenerId2)
//     }
//   }, [connection, owner])
// }
