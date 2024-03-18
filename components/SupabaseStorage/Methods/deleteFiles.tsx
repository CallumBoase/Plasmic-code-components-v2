import createClient from "@/utils/supabase/component";

type DeleteFiles = (bucketName: string, paths: string[]) => Promise<{ data: any; error: any }>;

export const deleteFiles : DeleteFiles = async (bucketName, paths) => {

  const supabase = createClient(); // establish the Supabase client
  
  const { data: dataResponse, error: errorResponse } = await supabase
  .storage
  .from(bucketName)
  .remove(
      paths
  )
  if (errorResponse) throw errorResponse
  if (dataResponse.length == 0) {
    throw new Error('No files were deleted - file/s do not exist or you are not authorized to delete them.')
  }

  return { data: dataResponse, error: errorResponse };
}