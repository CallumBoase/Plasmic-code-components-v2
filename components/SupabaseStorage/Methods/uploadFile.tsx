import createClient from '@/utils/supabase/component';
import { decode } from "base64-arraybuffer";

type UploadFile = (bucketName: string, path: string, base64FileData: string, contentType: string, upsert: boolean) => Promise<{ data: any, error: any }>;

// Upload a file
// Uploads a file to an existing bucket.
export const uploadFile : UploadFile = async (bucketName, path, base64FileData, contentType, upsert) => {
  const supabase = createClient(); // establish the Supabase client

  // build an object with only the options that have actually been set
  let options = Object.assign(
    {},
    contentType && { contentType: contentType }, //currently, we let the client specify the MIME-type. As it stands, if the client is manipulated, a user could upload a different file type to the MIME type they specify, circumventing Supabase file type restrictions. In future, it is suggested to derive the MIME-type in the backend.
    upsert && { upsert: upsert }
  );

  const { data: dataResponse, error: errorResponse } = await supabase.storage
    .from(bucketName)
    .upload(path, decode(base64FileData), options);
  if (errorResponse) throw errorResponse;

  return { data: dataResponse, error: errorResponse };
}
