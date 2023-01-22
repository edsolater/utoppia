import { createKit, Div, Image } from '@edsolater/uikit'
import { useFileHandle } from '../hooks/useFileHandle'

export interface PreviewPanelProps {
  handle?: FileSystemFileHandle
}

export const PreviewPanel = createKit('PreviewPanel', ({ handle }: PreviewPanelProps) => {
  const { type, url } = useFileHandle({ fileHandle: handle })
  return (
    <Div>
      {type === 'image' && url ? (
        <Image icss={{ width: '100%' }} src={url} />
      ) : type === 'video' && url ? (
        <video controls style={{ width: '100%' }} src={url} />
      ) : type === 'audio' && url ? (
        <audio style={{ width: '100%' }} src={url} />
      ) : (
        '[preview panel]'
      )}
    </Div>
  )
})
