import { createSignTransactionPortInMainThread } from "../txHandler/signAllTransactions_main"
import { createMessagePortTransforers } from "./createMessagePortTransforers"

export const sdkworker = import("./loadWorker_worker?worker").then((module) => new module.default())
export const { getMessagePort, getMessageReceiver, getMessageSender } = createMessagePortTransforers(sdkworker)
createSignTransactionPortInMainThread()
