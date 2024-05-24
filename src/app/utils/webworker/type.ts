import { MayEnum } from "@edsolater/fnkit"

export type WorkerMessage<T = any> = {
  command: string
  payload: T
}

export type WorkerCommand = MayEnum<
  | "fetch raydium supported tokens"
  | "fetch raydium pairs info"
  | "fetch raydium farms info"
  | "get raydium farms syn infos"
  | "get raydium token prices"
  | "let webworker calculate swap route infos"
>

export const workerCommands = {
  "fetch raydium supported tokens": "fetch raydium supported tokens",
  "fetch raydium pairs info": "fetch raydium pairs info",
  "fetch raydium farms info": "fetch raydium farms info",
  "fetch raydium clmm infos": "fetch raydium clmm info",
  "raydium sdk clmm infos": "raydium sdk clmm infos",
  "syn clmm infos": "syn clmm infos",
  "get raydium farms syn infos": "get raydium farms syn infos",
  "get raydium token prices": "get raydium token prices",
  "let webworker calculate swap route infos": "let webworker calculate swap route infos",
} satisfies Record<string, WorkerCommand>
