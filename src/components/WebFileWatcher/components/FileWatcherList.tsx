import { MayPromise } from '@edsolater/fnkit';
import { createKit, Div } from '@edsolater/uikit';
import { useToggle } from '@edsolater/uikit/hooks';
import { ComponentProps } from 'react';
import { FileSystemItemPair } from '../type';
import { isFileHandle, isFileOrDirectoryHandle } from '../utils/adjest';
import { getDirectoryEntries } from '../utils/getDirectoryEntries';
import { ListTable } from './BasicListTable';

export const FileWatcherList = createKit(
  'FileWatcherList',
  ({
    pairs, noHeader, onOpenFile
  }: {
    pairs: MayPromise<FileSystemItemPair[]>;
    noHeader?: boolean;
    onOpenFile?: ComponentProps<typeof FilenameItemFilenameCell>['onOpenFile'];
  }) => {
    return (
      <ListTable
        icss={{ overflow: 'layout', flex: 1 }}
        items={pairs}
        showHeader={!noHeader}
        anatomy={{
          itemRow: {
            icss: {
              alignItems: 'start'
            }
          },
          renderItemCell: ({ value, key, item }) => key === 'filename' ? (
            isFileOrDirectoryHandle(item.value) ? (
              isFileHandle(item.value) ? (
                <FilenameItemFilenameCell onOpenFile={onOpenFile} handler={item.value} />
              ) : (
                <Div>{item.filename}</Div> //TODO <-- use <Text>
              )
            ) : (
              String(value)
            )
          ) : isFileOrDirectoryHandle(item.value) ? (
            isFileHandle(item.value) ? null : (
              <DirectoryItemValueCell onOpenFile={onOpenFile} handler={item.value} />
            )
          ) : (
            String(value)
          )
        }} />
    );
  }
);
const FilenameItemFilenameCell = createKit(
  'FilenameItemFilenameCell',
  ({
    handler, onOpenFile
  }: {
    handler: FileSystemFileHandle;
    onOpenFile?: (fileHandle: FileSystemFileHandle) => void;
  }) => {
    return (
      <Div
        icss={{ textDecoration: 'underline' }}
        onClick={() => {
          onOpenFile?.(handler);
        }}
      >
        {handler.name}
      </Div>
    );
  }
);
const DirectoryItemValueCell = createKit(
  'DirectoryItemValueCell',
  ({
    handler, onOpenFile
  }: {
    handler: FileSystemDirectoryHandle;
    onOpenFile?: ComponentProps<typeof FilenameItemFilenameCell>['onOpenFile'];
  }) => {
    const [hasToggled, controller] = useToggle();
    return hasToggled ? (
      <FileWatcherList noHeader onOpenFile={onOpenFile} pairs={getDirectoryEntries(handler)} />
    ) : (
      <Div onClick={controller.on}>▶️</Div>
    );
  }
);
