const config = {
  reportOn: import.meta.env.MODE === "development",
}

export function configLog(options: { shouldReport: boolean }) {
  if (options.shouldReport) {
    config.reportOn = true
  }
}

export function reportLog(...labels: any[]) {
  if (config.reportOn) {
    console.log(...labels)
  }
}
