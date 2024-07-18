import { glob } from "goober"

export function initAppContextConfig(options: { themeMode?: "light" | "dark"; onlyAltSelect?: boolean }) {
  //#region ---------------- themeMode ----------------

  if ("themeMode" in options) {
    if (options.themeMode === "dark") {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    }
    if (options.themeMode === "light") {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    }
  }
  //#endregion

  //#region ---------------- onlyAltSelect ----------------
  if ("onlyAltSelect" in options) {
    document.addEventListener("keydown", (e) => {
      if (e.altKey) {
        document.documentElement.classList.remove("only-alt-select")
      }
    })
    document.addEventListener("keyup", (e) => {
      if (!e.altKey) {
        document.documentElement.classList.add("only-alt-select")
      }
    })
    glob`
    .only-alt-select * {
      user-select: none;
    }
  `
  }

  //#endregion
}
