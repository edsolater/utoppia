/**
 * merge two solidjs store, without effect anything
 *
 * use can setStore by just set it,
 *
 * if the shadow property is in inputed store1, it will change store1.
 * else if it is inputed store2, it will change store2.
 * else if it it not in store1 or store2, it will set to itself.
 * @todo move to fnkit utils
 */
export function mergeTwoStore<U extends object, T extends object>(store1: U, store2: T): U & T {
  // const [store, setStore] = createStore({})
  // const setMergedStore = (key: string, value: any) => {
  //   if (key in store1) {
  //     options.setStore1?.(store1)
  //   } else if (key in store2) {
  //     options.setStore2?.(store2)
  //   }
  // }
  const mergedStore = new Proxy(store2, {
    get(traget, key) {
      return key in store2 ? Reflect.get(store2, key) : key in store1 ? Reflect.get(store1, key) : undefined;
    },
  }) as U & T;

  return mergedStore;
}
