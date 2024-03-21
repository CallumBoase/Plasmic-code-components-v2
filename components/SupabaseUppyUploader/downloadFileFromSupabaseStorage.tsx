import createClient from "@/utils/supabase/component";

export default async function downloadFileFromSupabaseStorage(
  bucketName: string,
  filePath: string
) {
  console.log(bucketName);
  console.log(filePath);
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(filePath);
  if (error) {
    throw error;
  }
  return data;
}