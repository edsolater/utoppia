import { Switch } from '@edsolater/uikit'
import { ExamplePanel } from '../utils/ExamplePanel'

export function SwitchExample() {
  return (
    <ExamplePanel name='Switch'>
      <Switch defaultChecked />
      <Switch />
    </ExamplePanel>
  )
}
