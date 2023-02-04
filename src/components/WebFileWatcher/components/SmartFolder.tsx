import { createKit, Div } from '@edsolater/uikit'
import { useAsyncMemo, useAsyncValue } from '@edsolater/uikit/hooks'
import { getFileDetail } from '../utils/getFileDetail'

export interface SmartFolderProps {
  handle?: FileSystemFileHandle
}

export const SmartFolder = createKit('SmartFolder', ({ handle }: SmartFolderProps) => {
  const { asyncMoreFileDetails, asyncUrl, name } =
    useAsyncMemo(async () => {
      return getFileDetail(handle)
    }, [handle]) ?? {}
  const url = useAsyncValue(asyncUrl)
  const { imageWidth, imageHeight, size } = useAsyncValue(asyncMoreFileDetails) ?? {}
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
