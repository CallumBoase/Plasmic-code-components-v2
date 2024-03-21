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
import deleteFileFromSupabaseStorage from "./deleteFileFromSupabaseStorage";
import getSafeValues, { GetSafeValuesResult } from "./getSafeValues";

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
  deleteFromSupabaseStorageOnRemove: boolean;
  allowMultipleUploadBatches: boolean;
  autoProceed: boolean;
  width?: number;
  height?: number;
  theme: "light" | "dark" | "auto";
  showDoneButton: boolean;
  onDoneButtonClick: () => void;
  onStatusChange: (status: string) => void;
  onValueChange: (value: GetSafeValuesResult) => void;
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
  deleteFromSupabaseStorageOnRemove,
  allowMultipleUploadBatches,
  autoProceed,
  showDoneButton,
  onDoneButtonClick,
  width,
  height,
  theme,
  onStatusChange,
  onValueChange,
}: SupabaseUppyUploaderProps) {

  const [ready, setReady] = useState(false);
  const [uppy, setUppy] = useState<Uppy | null>();
  const onValueChangeCallback = useDeepCompareCallback(onValueChange, [onValueChange]);
  const onStatusChangeCallback = useDeepCompareCallback(onStatusChange, [onStatusChange]);

  //Callback for when a file is added to Uppy
  const fileAddedHandler = useCallback((file: UppyFile) => {

    onStatusChangeCallback("Uploads processing");
    onValueChangeCallback(getSafeValues(uppy?.getFiles()));

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

  }, [uppy, bucketName, folder, onStatusChangeCallback, onValueChangeCallback]);

  //Callback for when a file is removed from Uppy
  const fileRemovedHandler = useCallback(async (file: UppyFile, reason: string) => {

    const files = uppy?.getFiles();

    //We remove the file from Uppy instantly and delete in the background
    //Reason: we shouldn't force users to wait for file deletion and won't let them know of errors
    onValueChangeCallback(getSafeValues(files));

    //If there are no more files left, updated the status accordingly
    //Otherwise, the status is unchanged since remove operations are not awaited
    //Note that Uppy does not consider itself to be In Progress during file removal
    if(!files || files.length === 0) {
      onStatusChangeCallback("No files uploaded yet");
    }

    //Delete file from Supabase if appropriate (without waiting for result or telling the user about errors)
    if (reason === "removed-by-user" && deleteFromSupabaseStorageOnRemove) {
      try {
        await deleteFileFromSupabaseStorage(bucketName, file.meta.objectName as string);
      } catch(err) {
        //We don't do anything useful with the error here because we aren't making the user wait for deletion or fix errors
        console.log('error from supabase in file removal', err)
      }
    }
  }, [bucketName, onValueChangeCallback, onStatusChangeCallback, deleteFromSupabaseStorageOnRemove, uppy]);

  //Callback for when Uppy has completed uploading files (whether successful or not)
  const completeHandler = useCallback((_result: UploadResult) => {
    onValueChangeCallback(getSafeValues(uppy?.getFiles()));
    onStatusChangeCallback("All uploads complete");
  }, [onValueChangeCallback, onStatusChangeCallback, uppy]);

  //Callback to update value without changing processing value - used for various Uppy events that don't change processing state
  const runOnvalueChangeCallback = useCallback(() => {
    onValueChangeCallback(getSafeValues(uppy?.getFiles()));
  }, [onValueChangeCallback, uppy]);


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
    
    //Setup event listeners that allow the parent component to access up-to-date value and processing states
    if (uppy) {
      //When a file is first added
      uppy.on("file-added", fileAddedHandler);
      
      //Various progress events
      uppy.on("upload", runOnvalueChangeCallback);
      uppy.on("upload-progress", runOnvalueChangeCallback);
      uppy.on("progress", runOnvalueChangeCallback);
      uppy.on("upload-success", runOnvalueChangeCallback);
      uppy.on("error", runOnvalueChangeCallback);
      uppy.on("upload-error", runOnvalueChangeCallback);
      uppy.on("upload-retry", runOnvalueChangeCallback);
      uppy.on("retry-all", runOnvalueChangeCallback);
      uppy.on("restriction-failed", runOnvalueChangeCallback);
      uppy.on("reset-progress", runOnvalueChangeCallback);

      //All operations are complete - update value + processing to false
      uppy.on("complete", completeHandler);

      //When a file is removed
      uppy.on("file-removed", fileRemovedHandler);
    }

    //Cleanup old event listeners before re-adding new ones
    return () => {
      if (uppy) {
        uppy.off("file-added", fileAddedHandler);
        uppy.off("upload-progress", runOnvalueChangeCallback);
        uppy.off("upload", runOnvalueChangeCallback);
        uppy.off("progress", runOnvalueChangeCallback);
        uppy.off("upload-success", runOnvalueChangeCallback);
        uppy.off("error", runOnvalueChangeCallback);
        uppy.off("upload-error", runOnvalueChangeCallback);
        uppy.off("upload-retry", runOnvalueChangeCallback);
        uppy.off("retry-all", runOnvalueChangeCallback);
        uppy.off("restriction-failed", runOnvalueChangeCallback);
        uppy.off("reset-progress", runOnvalueChangeCallback);
        uppy.off("complete", completeHandler);
        uppy.off("file-removed", fileRemovedHandler);
      }
    }
  }, [uppy, fileAddedHandler, fileRemovedHandler, completeHandler, runOnvalueChangeCallback])

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
        //If showDoneButton is false, no handler therefore done button hidden
        //Otherwise show the done button & run the custom handler if present
        doneButtonHandler={!showDoneButton ? undefined : () => {
          //Run whatever custom handler the user has defined too, if present
          onDoneButtonClick();
        }}
        theme={theme}
      />
    </div>
  );
}

//Define the registration metatdata for plasmic studio
export const SupabaseUppyUploaderMeta : CodeComponentMeta<SupabaseUppyUploaderProps> = {
  name: "SupabaseUppyUploader",
  props: {
    bucketName: {
      type: "string",
      description: "The name of the supabase storage bucket to upload to",
    },
    folder: {
      type: "string",
      description: "The folder within the bucket to upload to (leave blank if you want to upload to the root of the bucket)"
    },
    theme: {
      type: "choice",
      defaultValue: "light",
      options: ["light", "dark", "auto"],
      description: "The theme (light or dark) of the Uppy uploader dashboard. Refresh the arena to see your changes take effect."
    },
    showDoneButton: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show the done button in the Uppy uploader dashboard. You can define what happens when the done button is clicked by adding an interaction action 'onDoneButtonClick'. Refresh the arena to see your changes take effect.",
    },
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
    deleteFromSupabaseStorageOnRemove: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to delete the file from Supabase Storage when the user removes it from the uploader interface (clicks 'X'). Note that deletion is not awaited and errors are not handled.",
    },
    onDoneButtonClick: {
      type: "eventHandler",
      argTypes: [],
      description:
        "Action to take when the done button is clicked in the Uppy uploader dashboard",
    },
    onStatusChange: {
      type: "eventHandler",
      argTypes: [
        {
          name: "status",
          type: "string",
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
    status: {
      type: "readonly",
      variableType: "text",
      onChangeProp: 'onStatusChange',
      initVal: "No files uploaded yet"
    }
  },
  importPath: "./index",
};
