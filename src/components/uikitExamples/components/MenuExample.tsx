import { Menu } from '@edsolater/uikit'
import { ExamplePanel } from '../utils/ExamplePanel'

const menu = [
  { name: 'Nellie', id: '0' },
  { name: 'Stephen', id: '1' },
  { name: 'Ronald', id: '2' },
  { name: 'Clifford', id: '3' }
]
export function MenuExample() {
  return (
    <ExamplePanel name='Menu'>
      <Menu
        menuItems={menu}
        defaultMenuItem={menu[1]}
        getKey={(i) => i.id}
        renderLabel={({ menu }) => menu.name}
      />
    </ExamplePanel>
  )
}
