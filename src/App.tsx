import { AppRoot } from '@edsolater/uikit'
import { useState } from 'react'
import { MainContentArea } from './components/MainContentArea'
import { SideMenuBar } from './components/SideMenuBar'
import { TopNavBar } from './components/TopNavBar'
import { sideMenu, SideMenuEntryItem } from './routes/sideMenuRouteConfig'
import { lightTheme } from './theme/lightTheme'
import { ThemeProvider } from './theme/ThemeProvider'

export function App() {
  const [activeEntryItem, setActiveEntryItem] = useState<SideMenuEntryItem>(
    sideMenu.entries.find((entry) => entry.defaultActive) ?? sideMenu.entries[0]
  )
  return (
    <ThemeProvider theme={lightTheme}>
      <AppRoot
        icss={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gridTemplate: `
            "nav  nav" 48px
            "side con" 1fr / 12em 1fr`
        }}
      >
        <TopNavBar icss={{ gridArea: 'nav' }} />
        <SideMenuBar
          icss={{ gridArea: 'side' }}
          entryItems={sideMenu.entries}
          activeEntryItem={activeEntryItem}
          onChangeItem={(entry) => {
            setActiveEntryItem(entry)
          }}
        />
        <MainContentArea icss={{ gridArea: 'con' }} renderContentComponent={activeEntryItem.component} />
      </AppRoot>
    </ThemeProvider>
  )
}
