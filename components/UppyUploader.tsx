import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import Tus from "@uppy/tus";
import createClient from "@/utils/supabase/component";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import getErrMsg from "@/utils/getErrMsg";

type UppyUploaderProps = {
  bucketName: string;
  folder?: string;
  maxNumberOfFiles: number;
  minNumberOfFiles: number;
  showProgressDetalis: boolean;
  showRemoveButtonAfterComplete: boolean;
};

function initUppy(
  supabaseProjectId: string,
  bearerToken: string,
  supabaseAnonKey: string,
  bucketName: string,
  folder?: string,
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
    // onError: function (error) {
    //   console.log("Failed because: " + error);
    // },
  });

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

  uppy.on("complete", (result) => {
    console.log(
      "Upload complete! We’ve uploaded these files:",
      result.successful
    );
    console.log(result);
  });

  //Not yet working
  uppy.on("file-removed", (file, reason) => {
    if (reason === "removed-by-user") {
      console.log("file removed by user", file);
      const supabase = createClient();

      const path = [file.meta.objectName as string];

      supabase.storage
        .from(bucketName)
        .remove(path)
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
  });

  return uppy;
}

export function UppyUploader({ bucketName, folder, maxNumberOfFiles, minNumberOfFiles, showProgressDetalis, showRemoveButtonAfterComplete }: UppyUploaderProps) {

  const [ready, setReady] = useState(false);
  const [uppy, setUppy] = useState<any>();

  //On initial render or when bucketName or folder changes
  //Initialize Uppy
  useEffect(() => {
    const supabaseProjectId = process.env
      .NEXT_PUBLIC_SUPABASE_URL!.split("//")[1]
      .split(".")[0];

    //Init supabase client
    const supabase = createClient();

    //Get session of logged in user (if present)
    supabase.auth.getSession().then((response) => {
      //Decide which token to use - anon or logged in user's
      let token = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      if (response.data.session?.access_token) {
        console.log("User logged in");
        token = response.data.session.access_token;
      }

      //Initialize Uppy
      setUppy(
        initUppy(
          supabaseProjectId,
          token,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          bucketName,
          folder,
        )
      );

      //Indicate that Uppy is ready
      setReady(true);
    });
  }, [bucketName, folder]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  if(uppy) {
    uppy.setOptions({
      restrictions: {
        maxNumberOfFiles: maxNumberOfFiles,
        minNumberOfFiles: minNumberOfFiles,
      },
    });
  }

  return (
    <Dashboard
      uppy={uppy}
      proudlyDisplayPoweredByUppy={false}
      showProgressDetails={showProgressDetalis}
      showRemoveButtonAfterComplete={showRemoveButtonAfterComplete}
    />
  );
}

export const UppyUploaderRegistration = {
  name: "UppyUploader",
  props: {
    bucketName: "string",
    folder: "string",
    maxNumberOfFiles: {
      type: "number",
      default: 10,
    },
    minNumberOfFiles: {
      type: "number",
      default: 1,
    },
  },
  states: {},
};
