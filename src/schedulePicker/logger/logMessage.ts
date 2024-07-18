/** for easier debug */
export function logMessage(options: {
  from?: "🎨main" | "👾worker"
  twoWordTitle: string
  detailDescription?: string
}) {
  console.log(
    `[${options.from}  ${options.twoWordTitle}] ${options.detailDescription ? `: ${options.detailDescription}` : ""}`,
  )
}
