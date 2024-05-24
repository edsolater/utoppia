import type { ReceiveMessage, Receiver, Sender, SenderMessage } from "./createMessagePortTransforers"

export function useMessagePort<Query, Data>(options: {
  port: { sender: Sender<SenderMessage<any>>; receiver: Receiver<ReceiveMessage<any>> }
  onBeforeSend?: () => void
  onReceive: (data: Data, utils: { sendBack: (data: any) => void }) => void
  onActionError?: (error?: unknown) => void
}): {
  /** only used it in  main thread */
  startQuery: (params: Query) => void
} {
  const { sender, receiver } = options.port as {
    sender: Sender<SenderMessage<Query>>
    receiver: Receiver<ReceiveMessage<Data>>
  }
  options.onBeforeSend?.()
  function startQuery(params: Query) {
    sender.post(params)
  }
  const { subscribe: receive } = receiver as Receiver<ReceiveMessage<Data>>
  receive((v) => options.onReceive(v, { sendBack: sender.post }))
  return { startQuery }
}
