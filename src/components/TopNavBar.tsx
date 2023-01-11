import { Button, createKit, Div, Grid, Motion, Row, Switch } from '@edsolater/uikit'
import { WrappedBy } from '@edsolater/uikit/plugins'
import { useState } from 'react'
import { defaultTheme } from '../theme/defaultTheme'
import { lightTheme } from '../theme/lightTheme'
import { useTheme, useThemeSetter } from '../theme/ThemeProvider'

export const TopNavBar = createKit('TopNavBar', () => {
  const theme = useTheme()
  const setTheme = useThemeSetter()
  const [flag] = useState(false)
  return (
    <Row icss={{ backgroundColor: theme?.colors.navBarBg, justifyContent: 'end', gap: 16 }}>
      <Row>
        <Div>Default Theme</Div>
        <Switch defaultChecked={flag} onToggle={(open) => (open ? setTheme(defaultTheme) : setTheme(lightTheme))} />
      </Row>
      <Grid icss={{ width: 200, border: '1px solid black', justifyContent: flag ? 'end' : 'start' }}>
        <Div
          plugin={WrappedBy((node) => (
            <Motion>{node}</Motion>
          ))}
          icss={{ width: 40, height: 40, background: 'dodgerblue' }}
        ></Div>
      </Grid>
      <Button onClick={() => setTheme?.(lightTheme)}>Light Theme</Button>
      <Button onClick={() => setTheme?.(defaultTheme)}>Default Theme</Button>
    </Row>
  )
})
