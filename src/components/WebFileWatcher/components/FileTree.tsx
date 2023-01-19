import { createKit } from '@edsolater/uikit';
import { getDirectoryEntries } from '../utils/getDirectoryEntries';
import { FileWatcherList, FileWatcherListProps } from './FileWatcherList';


export const FileTree = createKit(
  { name: 'FileTree', reactMemo: true },
  ({
    rootDirHandle, onOpenFile
  }: {
    rootDirHandle: FileSystemDirectoryHandle | undefined;
    onOpenFile?: FileWatcherListProps['onOpenFile'];
  }) => (
    <FileWatcherList
      icss={{
        flex: 1,
        overflow: 'overlay'
      }}
      pairs={getDirectoryEntries(rootDirHandle)}
      onOpenFile={onOpenFile}
    ></FileWatcherList>
  )
);
