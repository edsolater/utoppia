import { createKit, Div, Image } from '@edsolater/uikit'
import { useAsyncMemo, useAsyncValue } from '@edsolater/uikit/hooks'
import { getFileInfo } from '../utils/getFileInfo'

export interface PreviewPanelProps {
  handle?: FileSystemFileHandle
}

export const PreviewPanel = createKit('PreviewPanel', ({ handle }: PreviewPanelProps) => {
  const { genFileUrl, getFileDetails, file, name, type, mimeType } = useAsyncMemo(() => getFileInfo(handle)) ?? {}
  const url = useAsyncValue(genFileUrl)
  const { imageWidth, imageHeight, size } = useAsyncValue(getFileDetails) ?? {}
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
