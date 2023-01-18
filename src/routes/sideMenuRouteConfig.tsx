import { ReactNode } from 'react'
import { BilibiHome } from '../components/Bilibidi/home'
import { EditPlayground } from '../components/EditPlayround'
import { MotionGrid } from '../components/MotionGrid'
import { MatureTodoList } from '../components/TodoList/example/MatureTodoList'
import { UikitExhibition } from '../components/uikitExamples/examples'
import { FileWatcher } from '../components/WebFileWatcher'

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
      name: 'uikit exhibitions',
      entryIcon: '/example.svg',
      component: () => <UikitExhibition />,
    },
    {
      group: 'Playground',
      name: 'WebFileWatcher',
      entryIcon: '/example.svg',
      component: () => <FileWatcher />,
      defaultActive: true
    },
    {
      group: 'Examples',
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
      name: 'Bilibi',
      entryIcon: '/bilibili.svg',
      component: () => <BilibiHome />
    }
  ]
} as SideMenuEntries
