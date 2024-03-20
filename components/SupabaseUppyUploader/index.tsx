//React
import React, { useEffect, useState, useCallback } from "react";

//React custom hooks
import { useDeepCompareCallback } from "use-deep-compare";

//Plasmic
import { CodeComponentMeta } from "@plasmicapp/host";

//Uppy
import Uppy from "@uppy/core";
import type { UppyFile, UploadResult } from "@uppy/core";
import { Dashboard } from "@uppy/react";
import Tus from "@uppy/tus";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

//General utils
import getSupabaseProjectIdFromUrl from "@/utils/getSupabaseProjectIdFromUrl";
import getBearerTokenForSupabase from "@/utils/getBearerTokenForSupabase";

//Component-specific utils
import transformUploadResult, {type TransformedUploadResult } from "./transformUploadResult";
import deleteFileFromSupabaseStorage from "./deleteFileFromSupabaseStorage";

//Declare the props type
type SupabaseUppyUploaderProps = {
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
  onProcessingChange: (processing: boolean) => void;
  onValueChange: (value: TransformedUploadResult | null) => void;
  value: TransformedUploadResult | null;
};

//Helper function to init uppy
export function initUppy(
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



export function SupabaseUppyUploader({
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
  onProcessingChange,
  onValueChange,
}: SupabaseUppyUploaderProps) {

  const [ready, setReady] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>();
  const onValueChangeCallback = useDeepCompareCallback(onValueChange, [onValueChange]);
  const onProcessingChangeCallback = useDeepCompareCallback(onProcessingChange, [onProcessingChange]);

  //Callback for when a file is added to Uppy
  const fileAddedHandler = useCallback((file: UppyFile) => {
    console.log('file added start')

    onProcessingChangeCallback(true);

    //Construct the metadata that will be sent to supabase
    const supabaseMetadata = {
      bucketName: bucketName,
      objectName: folder ? `${folder}/${file.name}` : file.name,
      contentType: file.type,
    };

    //Add the metadata to the Uppy file object
    file.meta = {
      ...file.meta,
      ...supabaseMetadata,
    };

  }, [bucketName, folder, onProcessingChangeCallback]);

  //Callback for when a file is removed from Uppy
  const fileRemovedHandler = useCallback(async (file: UppyFile, reason: string) => {
    console.log('file removed handler');
    if (reason === "removed-by-user") {
      console.log("file removed handler => file removed by user");
      onProcessingChangeCallback(true);
      try {
        const { data } = await deleteFileFromSupabaseStorage(bucketName, file.meta.objectName as string);
        console.log("after supabase file removed");
        onProcessingChangeCallback(false);
      } catch(err) {
        console.log('error from supabase in file removal')
      }
    }
  }, [bucketName, onProcessingChangeCallback]);

  //Callback for when Uppy has completed uploading files
  const completeHandler = useCallback((result: UploadResult) => {
    console.log("Upload complete!");
    console.log(result);
    const transformedResult = transformUploadResult(result);
    onValueChangeCallback(transformedResult);
    onProcessingChangeCallback(false);
  }, [onValueChangeCallback, onProcessingChangeCallback]);

  //On initial render, initialize Uppy
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

  //When uppy.SetOptions props change, update the Uppy instance
  useEffect(() => {
    console.log("useeffect for setOptions");
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

  //Add callbacks to Uppy
  //When Uppy or one of the callbacks change, remove old ones then add new ones
  useEffect(() => {
    console.log('useEffect for file-added');
    if (uppy) {
      uppy.on("file-added", fileAddedHandler);
      uppy.on("file-removed", fileRemovedHandler);
      uppy.on("complete", completeHandler);
    }
    return () => {
      if (uppy) {
        uppy.off("file-added", fileAddedHandler);
        uppy.off("file-removed", fileRemovedHandler);
        uppy.off("complete", completeHandler);
      }
    }
  }, [uppy, fileAddedHandler, fileRemovedHandler, completeHandler])

  //Render loading state when necessary
  if (!ready) {
    return <div>Loading...</div>;
  }

  //Render the uploader
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

export const SupabaseUppyUploaderMeta : CodeComponentMeta<SupabaseUppyUploaderProps> = {
  name: "SupabaseUppyUploader",
  props: {
    bucketName: "string",
    folder: "string",
    width: {
      type: "number",
      description: "The width of the Uppy uploader dashboard in px. Refresh the arena to see your changes take effect.",
    },
    height: {
      type: "number",
      description: "The height of the Uppy uploader dashboard in px. Refresh the arena to see your changes take effect.",
    },
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
    showProgressDetails: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show progress details in the Uppy uploader dashboard. Refresh the arena to see your changes take effect.",
    },
    showRemoveButtonAfterComplete: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show the remove button after a file has been uploaded. Refresh the arena to see your changes take effect.",
    },
    onProcessingChange: {
      type: "eventHandler",
      argTypes: [
        {
          name: "processing",
          type: "boolean",
        },
      ],
    },
    onValueChange: {
      type: "eventHandler",
      argTypes: [
        {
          name: "value",
          type: "object",
        },
      ],
    }
  },
  states: {
    value: {
      type: "readonly",
      variableType: "object",
      onChangeProp: 'onValueChange'
    },
    processing: {
      type: "readonly",
      variableType: "boolean",
      onChangeProp: 'onProcessingChange',
      initVal: true
    }
  },
  importPath: "./index",
};
