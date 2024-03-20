import type { UploadResult, UploadedUppyFile, FailedUppyFile } from "@uppy/core";

//Helper function to transform the result received when Uppy has finished processing so successful[0].data or failed[0].data is no longer a File object
//This is necessary because setting the value of a parent state managed by Plasmic studio causes infinite re-renders if the value contains a File object
export default function transformUploadResult(originalObj : UploadResult) {
  
  // Function to extract file metadata and create a standard (non-File) object
  // We ommit the actual File data here
  const getFileMetadata = (item: Blob | File) => ({
      //extract the file name is item is a File not a Blob
      name: 'name' in item ? item.name : '',
      size: item.size,
      type: item.type,
      //extract the file extension is item is a File not a Blob
      extension: 'extension' in item ? item.extension : '',
  });

  // Function to transform the 'data' property of one items with Uppy's UploadResult.successful[] or UploadResult.failed[]
  //  and create a new object out of it
  const transformItem = (uploadResultItem: UploadedUppyFile<any, any> | FailedUppyFile<any, any>) => ({
      ...uploadResultItem,
      data: getFileMetadata(uploadResultItem.data)
  });

  // Transform the arrays and create a new object
  const transformArray = (array: UploadResult["successful"] | UploadResult["failed"]) => array.map(transformItem);

  return {
      ...originalObj,
      successful: originalObj.successful ? transformArray(originalObj.successful) : [],
      failed: originalObj.failed ? transformArray(originalObj.failed) : [],
  };
}

export type TransformedUploadResult = ReturnType<typeof transformUploadResult>;