import { createMemo } from "solid-js"
import { Accessify, KitProps, Text, TextRawProps, icssTitle, renderHTMLDOM, useKitProps } from "@edsolater/pivkit"
import { shrinkFn } from "@edsolater/fnkit"

export type TitleProps = Omit<
  TextRawProps & {
    htmlAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  },
  "children"
>

export type TitleKitProps = KitProps<
  TitleProps & {
    children?: Accessify<string | undefined>
  }
>

export function Title(kitProps: TitleKitProps) {
  const { props } = useKitProps(kitProps, { name: "Title", defaultProps: { htmlAs: "h2" } })
  const id = createMemo(() => shrinkFn(props.children) ?? "")
  return (
    <Text
      id={id()}
      htmlProps={{ id: id() }}
      render:self={(selfProps) => renderHTMLDOM(props.htmlAs, selfProps)}
      shadowProps={props}
      icss={[icssTitle, { marginBottom: "16px" }]}
    >
      {id()}
    </Text>
  )
}
