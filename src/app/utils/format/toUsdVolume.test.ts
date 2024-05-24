import { expect, test } from "vitest"
import toUsdVolume from "./toUsdVolume"

test("toUsdVolume basic test", () => {
  expect(toUsdVolume(0)).toBe("$0")
  expect(toUsdVolume(1000)).toBe("$1,000")
  expect(toUsdVolume(1000000, { shortcut: true })).toBe("$1M")

  expect(toUsdVolume("1000.12311")).toBe("$1,000.12")
})
