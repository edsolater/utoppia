import { createKit, Div } from '@edsolater/uikit'
import { useAsyncMemo, useAsyncValue } from '@edsolater/uikit/hooks'
import { ImagePreviewer } from '../../ImagePreviewer'
import { getFileDetail } from '../utils/getFileDetail'

export interface PreviewPanelProps {
  handle?: FileSystemFileHandle
}

export const PreviewPanel = createKit('PreviewPanel', ({ handle }: PreviewPanelProps) => {
  const { genFileUrl, getMoreFileDetails, file, name, type, mimeType } =
    useAsyncMemo(() => getFileDetail(handle), [handle]) ?? {}
  const url = useAsyncValue(genFileUrl)
  const { imageWidth, imageHeight, size } = useAsyncValue(getMoreFileDetails) ?? {}
  return (
    <Div>
      {/* active filename */}
      <Div>{name}</Div>

      <Div>
        {type === 'image' && url ? (
          <ImagePreviewer icss={{ width: '100%' }} src={url} />
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
