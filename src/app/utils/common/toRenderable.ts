import { isNumberish, toFormattedNumber, type Numberish, type NumberishFormatOptions } from "@edsolater/fnkit"

export function toRenderable(v: Numberish, options?: NumberishFormatOptions): string
export function toRenderable(v: Numberish | undefined, options?: NumberishFormatOptions): string | undefined
export function toRenderable(v: boolean): string
export function toRenderable(v: boolean | undefined): string | undefined
export function toRenderable(v: { toString(): string } | { [Symbol.toPrimitive](): string | number }): string
export function toRenderable(
  v: { toString?(): string | undefined } | { [Symbol.toPrimitive]?(): string | number | undefined } | undefined,
): string | undefined
export function toRenderable(v: unknown | void, options?: any): string
export function toRenderable(v: any, options?: any): string | undefined {
  if (v == null) return undefined
  if (isNumberish(v)) {
    try {
      return toFormattedNumber(v, options)
    } catch (error) {
      console.log(error)
      console.log("input: ", v)
      return ""
    }
  }
  return String(v)
}
