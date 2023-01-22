import { createKit, Div, Image } from '@edsolater/uikit'
import { useFileHandle } from '../hooks/useFileHandle'

export interface PreviewPanelProps {
  handle?: FileSystemFileHandle
}

export const PreviewPanel = createKit('PreviewPanel', ({ handle }: PreviewPanelProps) => {
  const { type, url, imageHeight, imageWidth, lastModified, mimeType, name, size } = useFileHandle({
    fileHandle: handle
  })
  return (
    <Div>
      {/* active filename */}
      <Div>{name}</Div>

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

      <Div>
        <Div>imageWidth: {imageWidth}</Div>
        <Div>imageHeight: {imageHeight}</Div>
        <Div>size: {size} bytes</Div>
      </Div>
    </Div>
  )
})
