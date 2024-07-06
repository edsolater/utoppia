import { isExist } from "@edsolater/fnkit"
import { shuckOptionTag } from "./shuck"

export type ShuckOption<T = any> = {
  value: T
  visible: boolean
  [shuckOptionTag]: true
}

export function createShuckOption<T>(description: { value: T; visible: boolean }): ShuckOption<T> {
  return {
    value: description.value,
    visible: description.visible,
    [shuckOptionTag]: true,
  }
}
export function isShuckOption<T>(value: any): value is ShuckOption<T> {
  return isExist(value) && value?.[shuckOptionTag]
}
