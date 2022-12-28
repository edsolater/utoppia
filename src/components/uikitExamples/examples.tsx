import { createKit, Grid } from '@edsolater/uikit'
import { MenuExample } from './components/MenuExample'
import { SwitchExample } from './components/SwitchExample'
import { TabsExample } from './components/TabExample'

export const UikitExhibition = createKit('UikitExhibition', () => (
  <Grid icss={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', padding: '16px 32px 0', gap:16 }}>
    <SwitchExample />
    <TabsExample />
    <MenuExample />
  </Grid>
))
