import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import type { UploadResult } from "@uppy/core";
import Tus from "@uppy/tus";
import createClient from "@/utils/supabase/component";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import getErrMsg from "@/utils/getErrMsg";
import getSupabaseProjectIdFromUrl from "@/utils/getSupabaseProjectIdFromUrl";

type UppyUploaderProps = {
  className: string;
  bucketName: string;
  folder?: string;
  maxNumberOfFiles?: number;
  minNumberOfFiles?: number;
  maxFileSize?: number;
  minFileSize?: number;
  allowedFileTypes: string | null;
  showProgressDetails: boolean;
  showRemoveButtonAfterComplete: boolean;
  allowMultipleUploadBatches: boolean;
  autoProceed: boolean;
  width?: number;
  height?: number;
};

function deleteFileInSupabase(bucketName: string, path: string) {
  const supabase = createClient();

  supabase.storage
    .from(bucketName)
    .remove([path])
    .then((response) => {
      if (response.error) throw Error(getErrMsg(response.error));
      //When no files failed to delete (path didn't exist) we get an empty array back not an error
      //We will consider this a failed deletion
      if (response.data.length === 0) throw Error("No file was deleted");
      console.log("file removed in supabase", response);
    })
    .catch((err) => {
      console.log("error removing file in supabase", err);
      //We don't try to handle failed removals. The user won't care if the file is still in supabase storage
    });
}

function initUppy(
  supabaseProjectId: string,
  bearerToken: string,
  supabaseAnonKey: string
) {
  const supabaseStorageURL = `https://${supabaseProjectId}.supabase.co/storage/v1/upload/resumable`;

  var uppy = new Uppy().use(Tus, {
    endpoint: supabaseStorageURL,
    headers: {
      // authorization: `Bearer ${BEARER_TOKEN}`,
      authorization: `Bearer ${bearerToken}`,
      apikey: supabaseAnonKey,
    },
    uploadDataDuringCreation: true,
    chunkSize: 6 * 1024 * 1024,
    allowedMetaFields: [
      "bucketName",
      "objectName",
      "contentType",
      "cacheControl",
    ],
  });

  return uppy;
}

//Helper function to the get anon or logged in user bearer token for supabase
async function getBearerTokenForSupabase() {
  //Init supabase client
  const supabase = createClient();

  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    //Return the anon token
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  } else {
    //Return the logged in user's auth token
    return data.session.access_token;
  }
}

export function UppyUploader({
  className,
  bucketName,
  folder,
  maxNumberOfFiles,
  minNumberOfFiles,
  maxFileSize,
  minFileSize,
  allowedFileTypes,
  showProgressDetails,
  showRemoveButtonAfterComplete,
  allowMultipleUploadBatches,
  autoProceed,
  width,
  height,
}: UppyUploaderProps) {
  const [ready, setReady] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>();
  const [value, setValue] = useState<UploadResult | null>(null);

  //On initial render or when bucketName or folder changes
  //Initialize Uppy
  //Known limitation: when bucketName or folder changes, the component will reinitialize Uppy, losing any current uploads
  //This means that bucketName and folder should never be changed after the component is mounted
  useEffect(() => {
    const supabaseProjectId = getSupabaseProjectIdFromUrl(
      process.env.NEXT_PUBLIC_SUPABASE_URL!
    );

    getBearerTokenForSupabase().then((token) => {
      //Initialize Uppy
      setUppy(
        initUppy(
          supabaseProjectId,
          token,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
      );

      //Indicate that Uppy is ready
      setReady(true);
    });
  }, []);

  //When maxNumberOfFiles or minNumberOfFiles changes, update Uppy's restrictions
  useEffect(() => {
    console.log("useeffect for max/min num files");
    if (uppy) {
      uppy.setOptions({
        restrictions: {
          maxNumberOfFiles: maxNumberOfFiles || 10,
          minNumberOfFiles: minNumberOfFiles || 1,
          maxFileSize: maxFileSize || 1000000,
          minFileSize: minFileSize || 0,
          allowedFileTypes: allowedFileTypes?.split(/,\s*/) || null,
        },
        allowMultipleUploadBatches: allowMultipleUploadBatches,
        autoProceed: autoProceed,
      });
    }
  }, [
    maxNumberOfFiles,
    minNumberOfFiles,
    maxFileSize,
    minFileSize,
    allowedFileTypes,
    allowMultipleUploadBatches,
    autoProceed,
    uppy,
  ]);

  //When bucketName or folder changes, update the file-added and file-removed event listeners
  useEffect(() => {
    if (uppy) {
      uppy.on("file-added", (file) => {
        const supabaseMetadata = {
          bucketName: bucketName,
          objectName: folder ? `${folder}/${file.name}` : file.name,
          contentType: file.type,
        };

        file.meta = {
          ...file.meta,
          ...supabaseMetadata,
        };

        console.log("file added", file);
      });

      uppy.on("file-removed", (file, reason) => {
        if (reason === "removed-by-user") {
          console.log("file removed by user", file);
          deleteFileInSupabase(bucketName, file.meta.objectName as string);
        }
      });
    }
  }, [bucketName, folder, uppy]);

  uppy?.on("complete", (result) => {
    console.log("Upload complete!");
    console.log(result);
  });

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div className={className}>
      <Dashboard
        uppy={uppy as Uppy}
        proudlyDisplayPoweredByUppy={false}
        width={width}
        height={height}
        showProgressDetails={showProgressDetails}
        showRemoveButtonAfterComplete={showRemoveButtonAfterComplete}
      />
    </div>
  );
}

export const UppyUploaderRegistration = {
  name: "UppyUploader",
  props: {
    bucketName: "string",
    folder: "string",
    maxNumberOfFiles: {
      type: "number",
      defaultValue: 10,
      description: "The maximum number of files that can be uploaded",
    },
    minNumberOfFiles: {
      type: "number",
      defaultValue: 1,
      description: "The minimum number of files that must be uploaded",
    },
    maxFileSize: {
      type: "number",
      defaultValue: 1000000,
      description: "The maximum size of each file in bytes",
    },
    minFileSize: {
      type: "number",
      defaultValue: 0,
      description: "The minimum size of each file in bytes",
    },
    allowedFileTypes: {
      type: "string",
      description:
        "A comma separated list of file types that are allowed (which we will convert to an array and provide to Uppy see uppy docs -> restrictions https://uppy.io/docs/uppy/#restrictions). To allow all file types unset this value.",
    },
    showProgressDetails: {
      type: "boolean",
      defaultValue: true,
      desciption:
        "Whether to show progress details in the Uppy uploader dashboard",
    },
    showRemoveButtonAfterComplete: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show the remove button after a file has been uploaded",
    },
    allowMultipleUploadBatches: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to allow multiple batches of files to be uploaded. Eg the user uploads a batch, then another batch later.",
    },
    autoProceed: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to automatically start uploading files once they are added",
    },
    width: {
      type: "number",
      description: "The width of the Uppy uploader dashboard in px",
    },
    height: {
      type: "number",
      description: "The height of the Uppy uploader dashboard in px",
    },
  },
  states: {},
};
