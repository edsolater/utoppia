import { listenDomEvent } from "@edsolater/pivkit"

/**
 *
 * @param data can JSON.stringify data
 * @param filename? default is "data.json"
 */
export async function downloadJSON(data: unknown | Promise<unknown>, filename = "data.json") {
  Promise.resolve(data).then((data) => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  })
}

/**
 *
 * @returns JSON data
 */
export async function importJSONFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "JSON Files",
          accept: {
            "application/json": [".json"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    })
    const file = await fileHandle.getFile()
    const fileContent = await file.text()
    const jsonData = JSON.parse(fileContent)
    return jsonData
  } catch (error) {
    console.error("Error:", error)
    throw new Error("Failed to read JSON file")
  }
}
