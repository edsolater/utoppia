import { isArray, isObject, isObjectLiteral, map } from "@edsolater/fnkit"
import { rules } from "./rules"

export function encode(
  data: unknown,
  options?: {
    /** encode should false */
    mutate?: boolean
  },
): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canEncode?.(data)) {
      return rule.encode?.(data)
    }
  }

  // literal need to deeply parse
  if (isObjectLiteral(data) || isArray(data)) return (options?.mutate ? mutMap : map)(data, (v) => encode(v))

  // no match rule
  return data
}

export function decode(
  data: unknown,
  options?: {
    /** encode should false */
    mutate?: boolean
  },
): any {
  // try to match rule
  for (const rule of rules) {
    if (rule.canDecode?.(data)) {
      return rule.decode?.(data)
    }
  }

  // literal need to deeply parse
  // if (isObjectLiteral(data) || isArray(data)) return (options?.mutate ? mutMap : map)(data, (v) => decode(v)) // ⚡🤔 deep map will cause performance issue
  return data

  // no match rule
  return data
}

/** TODO: move to fnkit */
function mutMap(collection: object | any[], mapCallback: (v: any) => any) {
  if (isArray(collection)) {
    for (let i = 0; i < collection.length; i++) {
      collection[i] = mapCallback(collection[i])
    }
  } else if (isObject(collection)) {
    for (const key in collection) {
      collection[key] = mapCallback(collection[key])
    }
  }
  return collection
}

/** TODO: move to fnkit */
export function proxyObjectWithConfigs<T extends object>(
  obj: T,
  configFn: (options: { key: string | symbol; value: any }) => any,
): object {
  return new Proxy(
    {},
    {
      get(target, key, receiver) {
        if (key in target) return target[key]
        // if (valueMap.has(key)) return valueMap.get(key)
        if (!(key in obj)) return undefined
        const originalValue = Reflect.get(obj, key, receiver)
        const newV = configFn({ key, value: originalValue })
        Reflect.set(target, key, newV)
        return newV
      },
      set(target, p, newValue) {
        Reflect.set(target, p, newValue)
        return Reflect.set(obj, p, newValue)
      },
      deleteProperty(target, p) {
        Reflect.deleteProperty(target, p)
        return Reflect.deleteProperty(obj, p)
      },
      has: (target, key) => Reflect.has(obj, key) ?? Reflect.has(target, key),
      getPrototypeOf: () => Object.getPrototypeOf(obj),
      ownKeys: () => Reflect.ownKeys(obj),
      // for Object.keys to filter
      getOwnPropertyDescriptor: (target, prop) =>
        Reflect.getOwnPropertyDescriptor(target, prop) ?? Reflect.getOwnPropertyDescriptor(obj, prop),
      defineProperty(target, property, attributes) {
        Reflect.defineProperty(target, property, attributes)
        return Reflect.defineProperty(obj, property, attributes)
      },
    },
  )
}
