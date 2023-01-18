import { useAsyncMemo } from '@edsolater/uikit/hooks';
import { useState } from 'react';

export function useFileHandle() {
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle>();
  const url = useAsyncMemo(async () => {
    if (!fileHandle)
      return undefined;
    const file = await fileHandle.getFile();
    return URL.createObjectURL(file);
  }, [fileHandle]);

  const type = useAsyncMemo(async () => {
    if (!fileHandle)
      return undefined;
    const file = await fileHandle.getFile();
    const type = file.type;
    return type.startsWith('video')
      ? 'video'
      : type.startsWith('image')
        ? 'image'
        : type.startsWith('audio')
          ? 'audio'
          : 'unknown';
  }, [fileHandle]);

  return { url, type, setFileHandle };
}
