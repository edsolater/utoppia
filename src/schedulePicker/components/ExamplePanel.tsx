import { KitProps, useKitProps, Piv, Box, Text } from "@edsolater/pivkit"

export interface ExamplePanelRawProps {
  name?: string
}

export type ExamplePanelProps = KitProps<ExamplePanelRawProps>

export function ExamplePanel(rawProps: ExamplePanelProps) {
  const { props } = useKitProps(rawProps)
  return (
    <Piv shadowProps={props}>
      <Text icss={{ fontWeight: "bold", fontSize: "2.5rem" }}>{props.name}</Text>
      <Box>{props.children}</Box>
    </Piv>
  )
}
