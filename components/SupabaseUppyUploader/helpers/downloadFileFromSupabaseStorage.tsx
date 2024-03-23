import createClient from "@/utils/supabase/component";

export default async function downloadFileFromSupabaseStorage(
  bucketName: string,
  filePath: string
) {
  console.log('download file')
  const supabase = createClient();
  return await supabase.storage
    .from(bucketName)
    .download(filePath);
}