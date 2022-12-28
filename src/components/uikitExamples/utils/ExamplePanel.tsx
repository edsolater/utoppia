import { createKit, Div, DivChildNode, Grid, Text } from '@edsolater/uikit'
import { ReactNode } from 'react'

export interface ExamplePanelProps {
  name?: string
  children?: DivChildNode
}

export const ExamplePanel = createKit('ExamplePanel', ({ name, children }: { name: string; children?: ReactNode }) => (
  <Div>
    <Text icss={{ fontWeight: 'bold', fontSize: '52px' }}>{name}</Text>
    <Grid icss={{ gap: 4 }}>{children}</Grid>
  </Div>
))
