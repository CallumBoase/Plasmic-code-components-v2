import createClient from "@/utils/supabase/component";

export default async function downloadFileFromSupabaseStorage(
  bucketName: string,
  filePath: string
) {
  const supabase = createClient();
  return await supabase.storage
    .from(bucketName)
    .download(filePath);
}