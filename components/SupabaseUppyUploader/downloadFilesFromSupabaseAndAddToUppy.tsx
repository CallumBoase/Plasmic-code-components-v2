import downloadFileFromSupabaseStorage from "./downloadFileFromSupabaseStorage";
import Uppy from "@uppy/core";

export default async function downloadFilesFromSupabaseAndAddToUppy(initialFileNames: Array<string>, uppy: Uppy, bucketName: string, folder?: string) {

  //Create a list of promises, 1 per file
  const promises = initialFileNames.map(async (fileName) => {

    const path = folder ? `${folder}/${fileName}` : fileName;

    //Download the file from Supabase storage
    const fileData = await downloadFileFromSupabaseStorage(bucketName, path);

    //Add the file to Uppy
    const fileId = uppy.addFile({
      name: fileName,
      data: fileData,
      type: fileData.type,
    });
    
    //Immediately set the file state to upload complete so Uppy doesn't try to upload it
    uppy.setFileState(fileId, {
      progress: { uploadComplete: true, uploadStarted: true }
    });

    //Set the file meta data so it can be deleted if user clears it from uppy
    uppy?.setFileMeta(fileId, {
      bucketName: bucketName,
      objectName: path,
      contentType: fileData.type,
    })
    
    //Resolve the promise with no value
    return;
  });

  //Wait for all promises to resolve and return an array of results (which will have nothing useful in it in this case)
  //If any promise rejects, the whole function will reject immediately
  return await Promise.all(promises);

}