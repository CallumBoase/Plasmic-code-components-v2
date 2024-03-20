//React
import React, { useEffect, useState } from "react";

//React custom hooks
import { useDeepCompareCallback } from "use-deep-compare";

//Plasmic
import { CodeComponentMeta } from "@plasmicapp/host";

//Uppy
import Uppy from "@uppy/core";
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

  // const [value, setValue] = useState<UploadResult | null>(null);
  // const [processing, setProcessing] = useState(false);

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

  //When bucketName or folder changes, update the file-added and file-removed event listeners
  useEffect(() => {
    console.log("useeffect for bucketName or folder");
    if (uppy) {
      uppy.on("file-added", (file) => {

        // onProcessingChange(true);

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
          deleteFileFromSupabaseStorage(bucketName, file.meta.objectName as string);
        }
      });
    }
  }, [bucketName, folder, uppy]);

  //When onValueChangeCallback changes, update the uppy instance
  useEffect(() => {
    console.log('use effect for complete')
    uppy?.on("complete", (result) => {
      console.log("Upload complete!");
      console.log(result);
      const transformedResult = transformUploadResult(result);
      onValueChangeCallback(transformedResult);
      //Infinite re-render occurs even if we do {...result}
      //So we do it this way
      // onValueChangeCallback(JSON.parse(JSON.stringify(result)));
    });
  }, [uppy, onValueChangeCallback]);

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
  },
  importPath: "./SupabaseUppyUploader",
};
