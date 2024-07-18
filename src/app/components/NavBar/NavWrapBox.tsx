import { KitProps, Piv, renderAsHTMLNav, useKitProps } from "@edsolater/pivkit"

export interface NaBar_NavWrapBoxProps {}

export function NaBar_NavWrapBox(kitProps: KitProps<NaBar_NavWrapBoxProps>) {
  const { shadowProps, props } = useKitProps(kitProps)

  return (
    <Piv<"nav">
      shadowProps={shadowProps}
      icss={{ userSelect: "none", padding: "16px 48px", transition: "150ms" }}
      defineSelf={renderAsHTMLNav}
    />
  )
}
