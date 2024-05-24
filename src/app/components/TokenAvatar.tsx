import { Box, Image, KitProps, useKitProps } from "@edsolater/pivkit"
import { Tokenable } from "../stores/data/token/type"
import { useToken } from "../stores/data/token/useToken"

export interface TokenAvatarRawProps {
  token?: Tokenable
  /** xs: 12px | sm: 20px | smi: 24px | md: 32px | lg: 48px | 2xl: 80px | (default: md) */
  size?: "xs" | "sm" | "smi" | "md" | "lg" | "2xl"
}

type TokenAvatarProps = KitProps<TokenAvatarRawProps>

export function TokenAvatar(kitProps: TokenAvatarProps) {
  const { props, shadowProps } = useKitProps(kitProps, { name: "TokenAvatar", defaultProps: { size: "md" } })
  const token = useToken(props.token)
  const size =
    props.size === "2xl"
      ? "80px"
      : props.size === "lg"
        ? "48px"
        : props.size === "md"
          ? "24px"
          : props.size === "sm"
            ? "18px"
            : "12px"
  return (
    <Box
      shadowProps={shadowProps}
      icss={{
        "--size": size,
        borderRadius: "50%",
        padding: "4px",
        background: "linear-gradient(126.6deg, rgba(171, 196, 255, 0.2) 28.69%, rgba(171, 196, 255, 0) 100%)",
        // border: 'solid #616A9D',
        borderWidth: "thin",
        width: "var(--size)",
        height: "var(--size)",
      }}
    >
      <Image
        src={token.icon}
        alt={token.name ?? token.symbol}
        icss={{
          borderRadius: "50%",
          overflow: "hidden",
        }}
      />
    </Box>
  )
}
