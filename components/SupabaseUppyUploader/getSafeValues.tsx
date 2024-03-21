import type { UppyFile } from '@uppy/core'

//Helper function to extract the safe values from Uppy file object
//Which is everything minus the data prop (which is a File object)
//Reason: passing a File object to Plasmic studio causes infinite re-render
export default function getSafeValues(Files: Array<UppyFile> | null | undefined) {
  if (!Files) {
    return null;
  }
  return Files.map((file) => {
    //Return all but data prop of file
    const { data, ...rest } = file;
    return rest;
  });
}

export type GetSafeValuesResult = ReturnType<typeof getSafeValues>;