import { MayPromise, mapGet } from "@edsolater/fnkit"

interface SenderMessage<Query = any> {
  command: string
  payload?: Query
}

export function isSenderMessage(v: unknown): v is SenderMessage {
  return typeof v === "object" && v !== null && "command" in v
}
/**
 * send a command to webworker
 */
interface Sender<P extends SenderMessage> {
  query(payload: P["payload"]): void
  // onMessageBack(payload: any): Promise<unknown> //TODO: imply it later
}
// cache store
const registeredWorkerMessageSender = new Map<string, Sender<any>>()

/**
 *
 * @param towardsTarget function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
export function createMessageSender<P extends SenderMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): Sender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): Sender<P> {
    return {
      query(payload) {
        Promise.resolve(towardsTarget).then((targetPort) => targetPort.postMessage({ command, payload: payload }))
      },
    }
  }
  return mapGet(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
