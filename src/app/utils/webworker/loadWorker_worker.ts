/// <reference lib="webworker" />
import "./worker_polyfill"; // for DeFi base on Buffer, but it's nodejs build-in Buffer

import { Subscribable, createSubscribable, invoke, invokeOnce } from "@edsolater/fnkit"
import { encode } from "../dataTransmit/handlers"
import { createMessagePortTransforers } from "./createMessagePortTransforers"
import { isSenderMessage } from "./genMessageSender"
import { WorkerMessage } from "./type"
import { applyWebworkerRegisters } from "./worker_registers"

type onMessage<D> = (utils: { payload: D; resolve(value: any): void }) => void

const callbackMap = new Map<string, onMessage<any>>()
const returnValueMap = new WeakMap<onMessage<any>, Subscribable<any>>()

export const { getMessageReceiver, getMessageSender, getMessagePort } = createMessagePortTransforers(globalThis)
/**
 *
 * register receiver utils in worker-side
 */
function initMessageReceiver() {
  globalThis.addEventListener("message", async (ev) => {
    const messageBody = ev.data
    if (!isSenderMessage(messageBody)) return
    const { command, payload } = messageBody
    const onMessage = callbackMap.get(command)
    if (!onMessage) return

    const subscribable = createSubscribable()
    returnValueMap.set(onMessage, subscribable)

    invoke(onMessage, { payload, resolve: subscribable.set })
    returnValueMap.get(onMessage)?.subscribe((outputData) => {
      /**  need {@link encode}, so not `encode(returnData)` */
      const encodedData = outputData
      // LOG
      // console.log(`transforming ${description}...`, outputData, 'to', encodedData)
      globalThis.postMessage({ command, payload: encodedData } as WorkerMessage)
    })
  })
}

// only need to regist once in the worker thread
invokeOnce(initMessageReceiver)
invokeOnce(applyWebworkerRegisters, { getMessagePort, getMessageReceiver, getMessageSender })
