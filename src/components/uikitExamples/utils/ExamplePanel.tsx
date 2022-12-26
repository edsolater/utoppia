import { Div, Grid, Text } from '@edsolater/uikit'
import { ReactNode } from 'react'

export function ExamplePanel({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <Div>
      <Text icss={{ fontWeight: 'bold', fontSize: '52px' }}>{name}</Text>
      <Grid icss={{ gap: 4 }}>{children}</Grid>
    </Div>
  )
}
