import { Tabs } from '@edsolater/uikit'
import { ExamplePanel } from '../utils/ExamplePanel'

const tabs = [
  { name: 'Nellie', id: '0' },
  { name: 'Stephen', id: '1' },
  { name: 'Ronald', id: '2' },
  { name: 'Clifford', id: '3' }
]
export function TabsExample() {
  return (
    <ExamplePanel name='Tab' icss={{ gridColumn: 'span 2' }}>
      <Tabs
        tabs={tabs}
        defaultTab={tabs[1]}
        getKey={(i) => i.id}
        renderLabel={({ tab }) => tab.name}
      />
    </ExamplePanel>
  )
}
