import { createKit, Div } from '@edsolater/uikit'
import { useAsyncEffect, useDOM } from '@edsolater/uikit/hooks'
import { jFetch } from '@edsolater/uikit/jFetch'
import { useEffect, useMemo, useState } from 'react'

/**
 * see https://github.com/SocialSisterYi/bilibili-API-collect for bilibili API
 */
export const BilibiHome = createKit('BilibiHome', () => {
  const [iframeDom, setIframeDom] = useDOM<HTMLIFrameElement>()
  const [innerFetchedResult, setInnerFetchedResult] = useState()

  const innerWindow = useMemo(() => iframeDom?.contentWindow, [iframeDom])

  console.log('innerWindow: ', innerWindow)
  useAsyncEffect(async () => {
    if (!innerWindow) return
    const orginalFetch = innerWindow.fetch
    console.log('orginalFetch: ', orginalFetch)
    innerWindow.fetch = new Proxy(orginalFetch, {
      apply(target, thisArg, argArray) {
        console.log('fetched: ')
        const res = Reflect.apply(target, thisArg, argArray) as Promise<Response>
        res.then((r) => r.json()).then((d) => setInnerFetchedResult(d))
        return res
      }
    })
    setTimeout(() => {
      innerWindow.alert('sdfsdf')
    }, 1000)
  }, [innerWindow])
  useEffect(() => {
    console.log('innerFetchedResult: ', innerFetchedResult)
  }, [innerFetchedResult])

  return (
    <Div icss={{ width: '100%', height: '100%' }}>
      <Div<'iframe'>
        domRef={setIframeDom}
        as='iframe'
        htmlProps={{
          id: 'inlineFrameExample',
          title: 'Inline Frame Example',
          width: '100%',
          height: '100%',
          src: 'https://www.bilibili.com'
        }}
      />
    </Div>
  )
})
