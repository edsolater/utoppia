- `/actions`: functions that will mutate(set) store
- `/atoms`: hold state
- `/methods`: functions that will pick data from store, user can use it if needed
- `/types`: typescript types declarations for store atom data structure
- `/utils`: pure functions which will no nothing to do with store
- `workerRegister.ts`: function call from webWorker scope

old:
/methods
/actions
store.ts
workerRegister.ts

new:
/atoms
/workerBridge -- receiver-register pair
