import { NumberishFormatOptions, Numberish, div, parseAnatomyNumberInfo, toFormattedNumber } from "@edsolater/fnkit"
/**
 * it depends on 'toFixed'
 */
export default function toUsdVolume(
  amount: Numberish | undefined,
  options?: {
    shortcut?: boolean
  } & NumberishFormatOptions,
) {
  if (!amount) return "$--"
  return `$${
    options?.shortcut
      ? toShortcutNumber(amount, { decimals: 2, ...options })
      : toFormattedNumber(amount, { decimals: 2, ...options })
  }`
}

/**
 * 1_000 => 1K
 * 1_000_000 => 1M
 * 1_000_000_000 => 1B
 * 1_000_000_000_000 => 1T
 */
export function toShortcutNumber(
  n: Numberish,
  options?: {
    disabled?: boolean
  } & NumberishFormatOptions,
): string {
  const formatFn = (n: Numberish) =>
    toFormattedNumber(n, {
      decimals: "auto",
      ...options,
    })
  try {
    const { int = "" } = parseAnatomyNumberInfo(n)
    const numberWeigth = int.length
    if (!options?.disabled && numberWeigth > 3 * 4) return `${formatFn(div(n, 1e12))}T`
    if (!options?.disabled && numberWeigth > 3 * 3) return `${formatFn(div(n, 1e9))}B`
    if (!options?.disabled && numberWeigth > 3 * 2) return `${formatFn(div(n, 1e6))}M`
    if (!options?.disabled && numberWeigth > 3 * 1) return `${formatFn(div(n, 1e3))}K`
    return `${formatFn(n)}`
  } catch {
    return "0"
  }
}
