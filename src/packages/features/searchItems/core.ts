import { MayArray, MayFn, flap, isNumber, isObject, isString, map, omit, shakeNil, shrinkFn } from "@edsolater/fnkit"
import { isStringInsensitivelyContain, isStringInsensitivelyEqual } from "./isStringEqual"

type SearchConfigItemObj = {
  text: string | undefined
  entirely?: boolean
}

export type SearchConfigItem = SearchConfigItemObj | string | undefined

export type SearchOptions<T> = {
  text?: string /* for controlled component */
  matchConfigs?: MayArray<MayFn<MayArray<SearchConfigItem>, [item: T]>>
}
/**
 * Searches an array of items for those that match a set of search options.
 *
 * @param items The array of items to search.
 * @param options The search options to use.
 * @returns An array of items that match the search options.
 */

export function searchItems<T>(items: T[] | undefined, options?: SearchOptions<T>): T[] {
  if (!items) return []
  if (!options) return items
  if (!options.text) return items
  const allMatchedStatusInfos = shakeNil(
    items.map((item) => getMatchedInfos(item, options.text!, options?.matchConfigs ?? extractItemBeSearchedText(item))),
  )
  const meaningfulMatchedInfos = allMatchedStatusInfos.filter((m) => m?.matched)
  const sortedMatchedInfos = sortByMatchedInfos<T>(meaningfulMatchedInfos)
  const shaked = shakeNil(sortedMatchedInfos.map((m) => m.item))
  return shaked
}
function extractItemBeSearchedText(item: unknown): SearchConfigItemObj[] {
  if (isString(item) || isNumber(item)) return [{ text: String(item) } as SearchConfigItemObj]
  if (isObject(item)) {
    const obj = map(omit(item as any, ["id", "key"]), (value) =>
      isString(value) || isNumber(value) ? ({ text: String(value) } as SearchConfigItemObj) : undefined,
    )
    return shakeNil(Object.values(obj))
  }
  return [{ text: "" }]
}

function getMatchedInfos<T>(item: T, searchText: string, searchTarget: NonNullable<SearchOptions<T>["matchConfigs"]>) {
  const searchKeyWords = String(searchText).trim().split(/\s|-/)
  const searchConfigs: SearchConfigItemObj[] = shakeNil(
    flap(searchTarget)
      .map((i) => shrinkFn(i, [item]))
      .flatMap((i) => flap(i))
      .map((c) => (isString(c) ? { text: c } : c)),
  )
  return patchSearchInfos({ item, searchKeyWords, searchConfigs })
}

type MatchedStatus<T> = {
  item: T
  matched: boolean
  allConfigs: SearchConfigItemObj[]
  matchedConfigs: {
    isEntirelyMatched: boolean

    config: SearchConfigItemObj
    configIdx: number

    searchedKeywordText: string
    searchedKeywordIdx: number
  }[]
}
/** it produce matched search config infos */
function patchSearchInfos<T>(options: {
  item: T
  searchKeyWords: string[]
  searchConfigs: SearchConfigItemObj[]
}): MatchedStatus<T> | undefined {
  const matchInfos: MatchedStatus<T> = {
    item: options.item,
    allConfigs: options.searchConfigs,
    matched: false,
    matchedConfigs: [],
  }
  for (const [keywordIdx, keyword] of options.searchKeyWords.entries()) {
    let keywardHasMatched = false
    for (const [configIdx, config] of options.searchConfigs.entries()) {
      const configIsEntirely = config.entirely
      const matchEntirely = isStringInsensitivelyEqual(config.text, keyword)
      const matchPartial = isStringInsensitivelyContain(config.text, keyword)
      if ((matchEntirely && configIsEntirely) || (matchPartial && !configIsEntirely)) {
        keywardHasMatched = true
        matchInfos.matched = true
        matchInfos.matchedConfigs.push({
          config,
          configIdx,
          isEntirelyMatched: matchEntirely,
          searchedKeywordIdx: keywordIdx,
          searchedKeywordText: keyword,
        })
      }
    }

    if (!keywardHasMatched) return // if some keyword don't match anything, means this item is not right candidate
  }
  return matchInfos
}
function sortByMatchedInfos<T>(matchedInfos: MatchedStatus<T>[]) {
  return [...matchedInfos].sort(
    (matchedInfoA, matchedInfoB) => toMatchedStatusSignature(matchedInfoB) - toMatchedStatusSignature(matchedInfoA),
  )
}
/**
 * so user can compare just use return number
 *
 * matchedInfo => [0, 1, 2, 0, 2, 1] =>  [ 2 * 4 + 2 * 2, 1 * 5 + 1 * 1] (index is weight) =>
 * 2 - entirely mathched
 * 1 - partialy matched
 * 0 - not matched
 *
 * @returns item's weight number
 */
function toMatchedStatusSignature<T>(matchedInfo: MatchedStatus<T>): number {
  const originalConfigs = matchedInfo.allConfigs
  const entriesSequence = Array.from({ length: originalConfigs.length }, () => 0)
  const partialSequence = Array.from({ length: originalConfigs.length }, () => 0)

  matchedInfo.matchedConfigs.forEach(({ configIdx, isEntirelyMatched }) => {
    if (isEntirelyMatched) {
      entriesSequence[configIdx] = 2 // [0, 0, 2, 0, 2, 0]
    } else {
      partialSequence[configIdx] = 1 // [0, 1, 0, 0, 2, 1]
    }
  })

  const calcCharateristicN = (sequence: number[]) => {
    const max = Math.max(...sequence)
    return sequence.reduce(
      (acc, currentValue, currentIdx) => acc + currentValue * (max + 1) ** (sequence.length - currentIdx),
      0,
    )
  }
  const characteristicSequence = calcCharateristicN([
    calcCharateristicN(entriesSequence),
    calcCharateristicN(partialSequence), //  1 * 5 + 1 * 1
  ])
  return characteristicSequence
}
