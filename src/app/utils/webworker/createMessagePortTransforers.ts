import { MayPromise, Subscribable, createSubscribable, hasProperty, mapGet } from "@edsolater/fnkit"

export interface ReceiveMessage<Data = any> {
  command: string
  data: Data
}
/** used when don't need any query payloads */
export type EmptyQuery = unknown
export interface SenderMessage<Query = any> {
  command: string
  query?: Query
}
export type Receiver<R extends ReceiveMessage> = Subscribable<R["data"]>
export type Sender<P extends SenderMessage, R extends ReceiveMessage = any> = {
  post(query?: P["query"]): Receiver<R>
}
export type GetMessagePortFn<Payload = any, Query = any> = (command: string) => {
  /** usually just use postMessage and receiveMessage*/
  receiver: Receiver<ReceiveMessage<Payload>>
  /** usually just use postMessage and receiveMessage*/
  sender: Sender<SenderMessage<Query>, ReceiveMessage<Payload>>
  postMessage: (query?: Query) => Sender<SenderMessage<Query>, any>["post"]
  receiveMessage: Receiver<ReceiveMessage<Payload>>["subscribe"]
}
export type GetMessageReceiverFn<Payload = any> = (command: string) => Receiver<ReceiveMessage<Payload>>
export type GetMessageSenderFn<Query = any> = (command: string) => Sender<SenderMessage<Query>, any>
export type PortUtils<Payload = any, Query = any> = {
  getMessageReceiver: GetMessageReceiverFn<Payload>
  getMessageSender: GetMessageSenderFn<Query>
  getMessagePort: GetMessagePortFn<Payload, Query>
}

// store all registered message receivers
const registeredWorkerMessageReceiver = new Map<string, Receiver<any>>()
// store all registered message senders
const registeredWorkerMessageSender = new Map<string, Sender<any>>()

/**
 * type guard
 */
export function isSenderMessage(v: unknown): v is SenderMessage {
  return hasProperty(v, "command")
}

/**
 * type guard
 */
export function isReceiveMessage(v: unknown): v is ReceiveMessage {
  return hasProperty(v, "command") && hasProperty(v, "data" satisfies keyof ReceiveMessage)
}

export function createMessagePortTransforers(towrardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>): {
  getMessageReceiver: <Payload = any>(command: string) => Receiver<ReceiveMessage<Payload>>
  getMessageSender: <Query = any>(command: string) => Sender<SenderMessage<Query>, any>
  getMessagePort: <Payload = any, Query = any>(
    command: string,
  ) => {
    /** usually just use postMessage and receiveMessage*/
    receiver: Receiver<ReceiveMessage<Payload>>
    /** usually just use postMessage and receiveMessage*/
    sender: Sender<SenderMessage<Query>, ReceiveMessage<Payload>>
    postMessage: (query?: Query) => Sender<SenderMessage<Query>, any>["post"]
    receiveMessage: Receiver<ReceiveMessage<Payload>>["subscribe"]
  }
} {
  const getReceiver = <Payload = any>(command: string) =>
    createMessageReceiver<ReceiveMessage<Payload>>(towrardsTarget, command)
  const getSender = <Query = any>(command: string) => createMessageSender<SenderMessage<Query>>(towrardsTarget, command)
  const getPort = <Payload = any, Query = any>(command: string) => {
    const sender = getSender<Query>(command)
    const receiver = getReceiver<Payload>(command)
    return {
      receiver,
      sender,
      postMessage: sender.post,
      receiveMessage: receiver.subscribe,
    }
  }
  return { getMessageReceiver: getReceiver, getMessageSender: getSender, getMessagePort: getPort }
}

/**
 * get(may auto create) a message receiver
 * cached
 * @param towardsTarget function to get the worker instance
 * @param receiverCommand an action id
 * @returns a subscribable object, which can be subscribed to get the data from worker
 * @pureFN
 */
function createMessageReceiver<R extends ReceiveMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  receiverCommand: string,
): Receiver<R> {
  /**
   *
   * @param command one message command combine one message receiver
   * @returns subscribable
   */
  function createNewMessageReceiver<R extends ReceiveMessage>(command: string): Receiver<R> {
    const subscribable = createSubscribable<R["data"]>()
    const messageHandler = (ev: MessageEvent<any>): void => {
      const body = ev.data as ReceiveMessage<R["data"]>
      if (body.command === command) {
        const decodedData = body.data
        subscribable.set(decodedData)
      }
    }
    Promise.resolve(towardsTarget).then((worker) =>
      worker.addEventListener("message", messageHandler as any /*  seems it's typescript's fault */),
    )
    return subscribable
  }

  return mapGet(registeredWorkerMessageReceiver, receiverCommand, () =>
    createNewMessageReceiver<R>(receiverCommand),
  )
}

/**
 *
 * cached
 * @param towardsTarget function to get the worker instance
 * @param command an action id
 * @returns
 * @pureFN
 */
function createMessageSender<P extends SenderMessage>(
  towardsTarget: MayPromise<Worker | ServiceWorker | typeof globalThis>,
  command: string,
): Sender<P> {
  function createNewWorkerMessageSender<P extends SenderMessage>(command: string): Sender<P> {
    return {
      post(data) {
        Promise.resolve(towardsTarget).then((targetPort) =>
          targetPort.postMessage({ command, data: data } satisfies ReceiveMessage),
        )
        return createMessageReceiver(towardsTarget, command)
      },
    }
  }
  return mapGet(registeredWorkerMessageSender, command, () => createNewWorkerMessageSender<P>(command))
}
