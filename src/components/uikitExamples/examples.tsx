import { createKit, Grid } from '@edsolater/uikit'
import { SwitchExample } from './components/SwitchExample'

export const UikitExhibition = createKit('UikitExhibition', () => (
  <Grid icss={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
    <SwitchExample />
  </Grid>
))

