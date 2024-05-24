import { type KitProps, Text, useKitProps } from "@edsolater/pivkit"
import { type Tokenable } from "../stores/data/token/type"
import { useToken } from "../stores/data/token/useToken"
import { Token } from "../stores/data/token/type"

export interface TokenSymbolBaseOption {
  /** @default true */
  wsolToSol?: boolean
}
export interface TokenSymbolProps extends TokenSymbolBaseOption {
  token?: Tokenable
}
export function TokenSymbol(kitProps: KitProps<TokenSymbolProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TokenSymbol" })
  const token = useToken(props.token)
  return <Text shadowProps={shadowProps}>{wsolToSol(token.symbol)}</Text>
}

function wsolToSol(s: Token["symbol"]) {
  if (s === "WSOL") return "SOL"
  return s
}
