import { ReactNode } from 'react'
import { BilibiHome } from '../components/Bilibidi/home'
import { EditPlayground } from '../components/EditPlayround'
import { MotionGrid } from '../components/MotionGrid'
import { MatureTodoList } from '../components/TodoList/example/MatureTodoList'

export type SideMenuEntryItem = {
  group: string
  name: string
  entryIcon: string
  component: () => ReactNode
  defaultActive?: boolean
}

export type SideMenuEntries = {
  entries: SideMenuEntryItem[]
}

export const sideMenu = {
  entries: [
    {
      group: 'Playground',
      name: 'motion grid',
      entryIcon: '/todo_list.svg',
      component: () => <MotionGrid />
    },
    {
      group: 'Examples',
      name: 'TodoList',
      entryIcon: '/todo_list.svg',
      component: () => <MatureTodoList />
    },
    {
      group: 'Examples',
      name: 'EditPlayground',
      entryIcon: '/example.svg',
      component: () => <EditPlayground />
    },
    {
      group: 'Examples',
      name: 'Bilibi',
      entryIcon: '/bilibili.svg',
      component: () => <BilibiHome />,
      defaultActive: true
    }
  ]
} as SideMenuEntries
