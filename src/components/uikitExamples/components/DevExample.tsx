import { Div } from '@edsolater/uikit'
import { scrollDetecter, scrollDetecterCSSVariableNames } from '@edsolater/uikit/plugins'
import { ExamplePanel } from '../utils/ExamplePanel'

export function DevExample() {
  return (
    <ExamplePanel name='Dev'>
      <Div
        icss={{ height: `calc(300px + var(${scrollDetecter.cssVariable['--dy']}, 0) * 1px)`, overflow: 'auto' }}
        plugin={scrollDetecter}
      >
        <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
        <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
        <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
      </Div>
    </ExamplePanel>
  )
}
