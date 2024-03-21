//React
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, useRef } from "react";

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
import downloadFilesFromSupabaseAndAddToUppy, {DownloadFilesFromSupabaseAndAddToUppyResult} from "./downloadFilesFromSupabaseAndAddToUppy";

//Decalre types for element actions
type SupabaseUppyUploaderActions = {
  removeFile: (fileID: string) => void;
  cancelAll: () => void;
  close: () => void;
}


type Status = "empty" | "uploads processing" | "uploads complete" | "initial files loaded";

//Declare the props type
type SupabaseUppyUploaderProps = {
  className: string;
  bucketName: string;
  folder?: string;
  initialFileNames?: Array<string>;
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
  onStatusChange: (status: Status) => void;
  onValueChange: (value: GetSafeValuesResult) => void;
  onInitialFileLoadResultChange: (value: DownloadFilesFromSupabaseAndAddToUppyResult) => void;
  loading: React.ReactNode;
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

//The component
export const SupabaseUppyUploader = forwardRef<SupabaseUppyUploaderActions, SupabaseUppyUploaderProps>(
  function SupabaseUppyUploader({
    className,
    bucketName,
    folder,
    initialFileNames,
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
    onInitialFileLoadResultChange,
    loading
  }: SupabaseUppyUploaderProps, ref) {

    //State for Uppy instance and ready status
    const [ready, setReady] = useState(false);
    const [uppy, setUppy] = useState<Uppy | null>();
    
    //Create state for initialFileNames, because if props changes we should NOT re-render
    const [initialFileNamesState] = useState(initialFileNames);

    //Create a stable reference to initial callback functions passed in as props
    //Since Plasmic studio seems to pass in changed function references on render, causing unecessary re-renders
    const onValueChangeCallback = useRef(onValueChange).current;
    const onStatusChangeCallback = useRef(onStatusChange).current;
    const onInitialFileLoadResultChangeCb = useRef(onInitialFileLoadResultChange).current;

    //Callback to run when a file is added to Uppy
    const fileAddedHandler = useCallback((file: UppyFile) => {

      //Send changed values to parent component (Plasmic studio)
      onStatusChangeCallback("uploads processing");
      onValueChangeCallback(getSafeValues(uppy?.getFiles()));

      //Construct custom metadata for the Uppy File object
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

      //Get the current files from Uppy
      const files = uppy?.getFiles();

      //We remove the file from Uppy instantly and run the delete API call in the background
      //Reason: we shouldn't force users to wait for file deletion and we won't force them to care about deletion errors
      onValueChangeCallback(getSafeValues(files));

      //If there are no more files left, set status back to "No file uploaded yet"
      //Otherwise, the status is unchanged
      //Note that Uppy does not consider itself to be In Progress during file removal, and we are OK with this
      if(!files || files.length === 0) {
        onStatusChangeCallback("empty");
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
      //Send changed values to parent component (Plasmic studio)
      onValueChangeCallback(getSafeValues(uppy?.getFiles()));
      onStatusChangeCallback("uploads complete");
    }, [onValueChangeCallback, onStatusChangeCallback, uppy]);

    //Callback to run when various processing events occur in Uppy
    const runOnvalueChangeCallback = useCallback(() => {
      //Send changed values to parent component (Plasmic studio)
      onValueChangeCallback(getSafeValues(uppy?.getFiles()));
    }, [onValueChangeCallback, uppy]);


    //On initial render, or when bucketName or objectName changes, re-initialize Uppy
    //Note that initialFileNames and onInitialFileLoadResultChangeCb will not cause re-render 
    //because we set those as stable state / refs based on initial props passed in
    useEffect(() => {

      const supabaseProjectId = getSupabaseProjectIdFromUrl(
        process.env.NEXT_PUBLIC_SUPABASE_URL!
      );

      getBearerTokenForSupabase().then(async (token) => {
        //Initialize Uppy
        const uppy = initUppy(
          supabaseProjectId,
          token,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        //If initialFileNames are provided, download them from Supabase Storage add them to the Uppy instance
        if (initialFileNamesState) {
          const result = await downloadFilesFromSupabaseAndAddToUppy(initialFileNamesState, uppy, bucketName, folder);
          
          //Send the result of initial file download to the parent component (Plasmic Studio)
          onInitialFileLoadResultChangeCb(result);

          //tell the parent component (Plasmic Studio) that the initial files have been loaded (no longer status = "empty")
          if(result.map(r => r.downloadSucceeded).length > 0) {
            onStatusChangeCallback("initial files loaded");
          }

        }

        setUppy(uppy);

        //Indicate that Uppy is ready
        setReady(true);
      });
    }, [initialFileNamesState, onInitialFileLoadResultChangeCb, onStatusChangeCallback, bucketName, folder]);

    //When various option props change, update the Uppy instance with the new options
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

    //Add callbacks to Uppy to keep the parent component up-to-date with values and customise behaviour of Uppy
    //These will be cleaned up when the component unmounts or when one of the dependencies changes
    useEffect(() => {
      
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

    //Define element actions to run from Plasmic studio
    useImperativeHandle(
      ref,
      () => {
        return {
          removeFile: (fileID: string) => {
            uppy?.removeFile(fileID);
          },
          cancelAll: () => {
            uppy?.cancelAll({reason: 'user'});
          },
          close: () => {
            uppy?.close({reason: 'user'});
          }
        };
      }
    )

    //Render loading slot when necessary
    if (!ready) {
      return(<div className={className}>{loading}</div>);
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
);

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
    initialFileNames: {
      type: 'array',
      description: 'Initial file names that are already uploaded, within the specified folder in Supabase Storage eg ["file1.jpg", "file2.jpg"]. This is used to pre-populate the Uppy uploader dashboard with files that are already uploaded.'
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
    },
    onInitialFileLoadResultChange: {
      type: "eventHandler",
      argTypes: [
        {
          name: "value",
          type: "object",
        },
      ],
    },
    loading: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Loading...",
      },
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
      initVal: "empty"
    },
    initialFileLoadResult: {
      type: "readonly",
      variableType: "object",
      onChangeProp: 'onInitialFileLoadResultChange',
      initVal: []
    }
  },
  refActions: {
    removeFile: {
      description: "Remove a file from the Uppy uploader, based on the File ID created by Uppy. Will NOT delete the file from Supabase.",
      argTypes: [
        {
          name: "fileID",
          type: "string",
        },
      ],
    },
    cancelAll: {
      description: "Cancel all uploads. Will NOT delete files from Supabase",
      argTypes: [],
    },
    close: {
      description: "Unmount the Uppy instance.",
      argTypes: [],
    }
  },
  importPath: "./index",
};
