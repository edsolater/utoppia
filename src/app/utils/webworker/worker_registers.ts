import { PortUtils } from "./createMessagePortTransforers"
import { logMessage } from "../../logger/logMessage"

export function applyWebworkerRegisters(messageTransformers: PortUtils) {
  logMessage({ from: "👾worker", twoWordTitle: "messge port", detailDescription: "registered load farm port" })
  // calculateSwapRouteInfosInWorker(messageTransformers)
  // txDispatcher_worker(messageTransformers)
  // loadFarmJsonInfosInWorker(messageTransformers)
  // loadFarmSYNInfosInWorker(messageTransformers)
  // loadPairsInWorker(messageTransformers)
  // loadTokensInWorker(messageTransformers)
  // loadOwnerTokenAccountsInWorker(messageTransformers)
  // loadTokenPriceInWorker(messageTransformers)
  // loadClmmInfosInWorker(messageTransformers)
}
