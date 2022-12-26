import { Div, Text } from '@edsolater/uikit'
import { ReactNode } from 'react'

export function ExampleGroup({ name, children }: { name: string; children?: ReactNode }) {
  return (
    <Div>
      <Text icss={{ fontWeight: '500', fontSize: '18px' }}>{name}</Text>
      {children}
    </Div>
  )
}
