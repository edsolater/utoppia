import { type KitProps, Row, useKitProps } from "@edsolater/pivkit"
import type { Token } from "../stores/data/token/type"
import { TokenAvatar, type TokenAvatarRawProps } from "./TokenAvatar"
import { TokenSymbol, type TokenSymbolProps } from "./TokenSymbol"

type TokenProps = {
  token?: Token
  propofTokenAvatar?: TokenAvatarRawProps
  propofTokenSymbol?: TokenSymbolProps
}

export function Token(kitProps: KitProps<TokenProps>) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "Token" })
  return (
    <Row shadowProps={shadowProps}>
      <TokenAvatar token={props.token} {...props.propofTokenAvatar} />
      <TokenSymbol token={props.token} {...props.propofTokenSymbol} />
    </Row>
  )
}
