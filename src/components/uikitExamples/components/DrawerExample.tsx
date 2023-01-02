import { Button, createDrawerTriggerPair, Drawer } from '@edsolater/uikit'
import { ExamplePanel } from '../utils/ExamplePanel'

const [r, c] = createDrawerTriggerPair()

export function DrawerExample() {
  return (
    <ExamplePanel name='Drawer'>
      <Button plugin={c}>Open</Button>
      <Drawer plugin={r}>Hello world</Drawer>
    </ExamplePanel>
  )
}
