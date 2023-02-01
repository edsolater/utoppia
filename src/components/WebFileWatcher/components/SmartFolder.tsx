import { createKit, Div, Image } from '@edsolater/uikit'
import { useAsyncMemo, useAsyncValue } from '@edsolater/uikit/hooks'
import { ImagePreviewer } from '../../ImagePreviewer'
import { FileSystemHandleView } from '../type'
import { getFileDetail } from '../utils/getFileDetail'
import { ListTable } from './BasicListTable'

export interface SmartFolderProps {
  handle?: FileSystemFileHandle
}

export const SmartFolder = createKit('SmartFolder', ({ handle }: SmartFolderProps) => {
  const { genFileUrl, getMoreFileDetails, file, name, type, mimeType } = useAsyncMemo(() => getFileDetail(handle)) ?? {}
  const url = useAsyncValue(genFileUrl)
  const { imageWidth, imageHeight, size } = useAsyncValue(getMoreFileDetails) ?? {}
  return (
    <Div>
      {/* active filename */}
      <Div icss={{ fontWeight: 'bold' }}>{name}</Div>
    </Div>
  )
})

// export const FileHandleList = createKit(
//   { name: 'FileHandleList' },
//   ({ files, onOpenFile, }: {files: FileSystemHandleView[], onOpenFile(file:FileSystemHandleView):void}) => (
//     <ListTable
//       items={files}
//       showHeader={false}
//       anatomy={{
//         itemRow: {
//           icss: {
//             alignItems: 'start'
//           }
//         },
//         renderItem: ({ item: handle }) =>
//           isFileHandle(handle) ? (
//             <FileRow handler={handle} parent={root} onOpenFile={onOpenFile} />
//           ) : (
//             <DirectoryRow handler={handle} parent={root} onOpenDirectory={onOpenDirectory} />
//           )
//       }}
//     />
//   )
// )
