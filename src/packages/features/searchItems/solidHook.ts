import { MayFn, isArray, shrinkFn } from "@edsolater/fnkit"
import { createDeferred, createMemo } from "solid-js"
import { SearchOptions, searchItems } from "./core"

export function useSearch<T>(
  items: (() => T[]) | T[],
  searchText: MayFn<string | undefined>,
  options?: SearchOptions<T>,
) {
  const allItems = createDeferred(() => (isArray(items) ? items : items()))
  const text = createDeferred(() => shrinkFn(searchText))
  const searchedItems = createMemo(
    () => searchItems(allItems(), { ...options, text: shrinkFn(text) }),
    searchItems(isArray(items) ? items : items(), { ...options, text: shrinkFn(text) }),
    { equals: (prev, next) => prev.length === next.length && prev.every((i, index) => i === next[index]) },
  )
  return { searchedItems }
}
