import { Div, icssFloatScrollbar } from '@edsolater/uikit'
import { useDOM } from '@edsolater/uikit/hooks'
import { scrollDetecter } from '@edsolater/uikit/plugins'
import { ExamplePanel } from '../utils/ExamplePanel'

export function DevExample() {
  const [bar, setBar] = useDOM()
  return (
    <ExamplePanel name='Dev'>
      <Div icss={{ position: 'relative', width: 200, contain: 'content' }}>
        <Div
          domRef={setBar}
          icss={{
            height: 50,
            background: '#bc0d0dd9',
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            transform: `translateY(clamp(-100%, var(${scrollDetecter.cssVariable['--speed-y-in-500ms']}) * 1000000%, 0px))`,
            transition: '300ms'
          }}
        ></Div>

        <Div
          icss={[
            {
              height: 300,
              overflow: 'auto'
            },
            icssFloatScrollbar
          ]}
          plugin={scrollDetecter({ detectTargetDOM: bar })}
        >
          <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
          <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
          <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
          <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
          <Div icss={{ width: 200, height: 200, background: 'linear-gradient(dodgerblue, skyblue)' }}></Div>
        </Div>
      </Div>
    </ExamplePanel>
  )
}
