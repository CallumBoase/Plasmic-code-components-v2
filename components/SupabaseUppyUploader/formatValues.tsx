import type { UppyFile } from '@uppy/core'

//Helper function format values for return to parent component
//We remove the data prop from each file object which is a Blob or File Object & causes infinite re-render in Plasmic Studio
//Then we add some extra information
export default function formatValues(Files: Array<UppyFile> | null | undefined) {
  if (!Files) {
    return null;
  }
  const safeFilesArray = Files.map((file) => {
    //Get all but data prop of file
    const { data, ...allPropsButData } = file;

    return allPropsButData;
  });

  const final = {
    rawFilesData: safeFilesArray,
    numSucceeded: safeFilesArray.filter((file) => file.progress?.uploadComplete).length,
    numFailed: safeFilesArray.filter((file) => file.progress?.uploadComplete === false).length,
    numAnyStatus: safeFilesArray.length,
    fileNamesOnly: safeFilesArray.map((file) => file.name),
    fileNamesWithFolder: safeFilesArray.map((file) => file.meta.objectName),
    fullPaths: safeFilesArray.map((file) => `${file.meta.bucketName}/${file.meta.objectName}`),
  };

  return final;

}

export type FormattedValues = ReturnType<typeof formatValues>;