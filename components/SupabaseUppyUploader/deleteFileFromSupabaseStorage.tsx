import createClient from "@/utils/supabase/component";
import getErrMsg from "@/utils/getErrMsg";

export default async function deleteFileFromSupabaseStorage (bucketName: string, path: string) {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucketName).remove([path]);

  if(error) {
    throw Error(getErrMsg(error));
  }

  if(data?.length === 0) {
    throw Error("No file was deleted");
  }

  return { data, error };



  // supabase.storage
  //   .from(bucketName)
  //   .remove([path])
  //   .then((response) => {
  //     if (response.error) throw Error(getErrMsg(response.error));
  //     //When no files failed to delete (path didn't exist) we get an empty array back not an error
  //     //We will consider this a failed deletion
  //     if (response.data.length === 0) throw Error("No file was deleted");
  //     console.log("file removed in supabase", response);
  //   })
  //   .catch((err) => {
  //     console.log("error removing file in supabase", err);
  //     //We don't try to handle failed removals. The user won't care if the file is still in supabase storage
  //   });
}

export type DeleteFileFromSupabaseStorage = typeof deleteFileFromSupabaseStorage;