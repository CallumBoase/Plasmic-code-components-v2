import downloadFileFromSupabaseStorage from "./downloadFileFromSupabaseStorage";
import Uppy from "@uppy/core";
import blobToBase64 from "@/utils/blobToBase64";

export default async function downloadFilesFromSupabaseAndAddToUppy(
  initialFileNames: Array<string>,
  uppy: Uppy,
  bucketName: string,
  folder?: string
) {
  //Create a list of promises, 1 per file
  const promises = initialFileNames.map(async (fileName) => {
    const path = folder ? `${folder}/${fileName}` : fileName;

    //Download the file from Supabase storage
    const { data, error } = await downloadFileFromSupabaseStorage(
      bucketName,
      path
    );

    //Don't try and add the file if there was an error, just log and return nothing
    if (error || !data) {
      console.error("Error downloading file from Supabase storage", error);
      return {
        downloadSucceeded: false,
        downloadErrored: true,
        uppyFileId: null,
        supabaseFileDataBase64String: null,
        fileName: fileName,
        bucketName: bucketName,
        folder: folder,
      };
    }

    const base64Data = await blobToBase64(data);

    //Add the file to Uppy
    const fileId = uppy.addFile({
      name: fileName,
      data: data,
      type: data.type,
    });

    //Immediately set the file state to upload complete so Uppy doesn't try to upload it
    uppy.setFileState(fileId, {
      progress: { uploadComplete: true, uploadStarted: true },
    });

    //Set the file meta data so it can be deleted if user clears it from uppy
    uppy?.setFileMeta(fileId, {
      bucketName: bucketName,
      objectName: path,
      contentType: data.type,
    });

    //Resolve the promise with no value
    return {
      downloadSucceeded: true,
      downloadErrored: false,
      uppyFileId: fileId,
      supabaseFileDataBase64String: base64Data,
      fileName: fileName,
      bucketName: bucketName,
      folder: folder,
    };
  });

  //Wait for all promises to resolve and return an array of results (which will have nothing useful in it in this case)
  //If any promise rejects, the whole function will reject immediately
  return await Promise.all(promises);
}

export type DownloadFilesFromSupabaseAndAddToUppyResult = {
  downloadSucceeded: boolean;
  downloadErrored: boolean;
  uppyFileId: string | null;
  supabaseFileDataBase64String: string | null;
  fileName: string;
  bucketName: string;
  folder?: string;
}[];
