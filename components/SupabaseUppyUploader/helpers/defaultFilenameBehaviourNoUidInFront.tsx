import Uppy from '@uppy/core';

export default function defaultFilenameBehaviourNoUidInFront(uppy: Uppy) {

  uppy.setOptions({
    onBeforeFileAdded: (newFile) => {
      return newFile;
    }
  })
}