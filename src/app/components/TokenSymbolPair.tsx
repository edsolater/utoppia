import { Box, Text, icssRow, useKitProps, type KitProps } from "@edsolater/pivkit"
import { type Tokenable } from "../stores/data/token/type"
import { TokenSymbol, TokenSymbolBaseOption } from "./TokenSymbol"

export interface TokenSymbolPairProps extends TokenSymbolBaseOption {
  token1?: Tokenable
  token2?: Tokenable
}
export function TokenSymbolPair(kitProps: KitProps<TokenSymbolPairProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TokenSymbol" })
  return (
    <Box shadowProps={shadowProps} icss={icssRow}>
      <TokenSymbol token={props.token1} wsolToSol={kitProps.wsolToSol} />
      <Text>-</Text>
      <TokenSymbol token={props.token2} wsolToSol={kitProps.wsolToSol} />
    </Box>
  )
}
