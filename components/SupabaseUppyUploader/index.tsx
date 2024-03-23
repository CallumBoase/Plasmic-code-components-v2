//Relevant docs
//Uppy react https://uppy.io/docs/react/
//Uppy core https://uppy.io/docs/uppy/
//Uppy dashboard https://uppy.io/docs/dashboard/
//Supabase Uppy Tus example this is based on https://github.com/supabase/supabase/blob/master/examples/storage/resumable-upload-uppy/README.md

//React
import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";

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
import { v4 as uuid } from "uuid";

//Component-specific utils
import deleteFileFromSupabaseStorage from "./helpers/deleteFileFromSupabaseStorage";
import formatValues, { FormattedValues } from "./helpers/formatValues";
import downloadFilesFromSupabaseAndAddToUppy, {DownloadFilesFromSupabaseAndAddToUppyResult} from "./helpers/downloadFilesFromSupabaseAndAddToUppy";

//Decalre types for element actions
type SupabaseUppyUploaderActions = {
  removeFile: (fileID: string) => void;
  cancelAll: () => void;
  close: () => void;
  reset: () => void;
}


type Status = "empty" | "uploads processing" | "uploads complete" | "initial files loaded";

//Declare the props type
type SupabaseUppyUploaderProps = {
  className: string;
  bucketName: string;
  folder?: string;
  avoidNameConflicts: "Each file in unique subfolder" | "Uid in front of filename" | "None";
  initialFilePaths?: Array<string>;
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
  onValueChange: (value: FormattedValues) => void;
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
      "x-upsert": "false",
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
    avoidNameConflicts,
    initialFilePaths,
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

    //States
    const [ready, setReady] = useState(false);
    const [uppy, setUppy] = useState<Uppy | null>();
    const [reset, setReset] = useState<number>(Math.random());
    
    //Create state for initialFilePaths that will NEVER change, so we don't re-render if it changes
    const [initialFilePathsState] = useState(initialFilePaths);

    //Callbacks from the various prop functions that can be passed in to pass state to parent component
    const onValueChangeCallback = useCallback(onValueChange, [onValueChange]);
    const onStatusChangeCallback = useCallback(onStatusChange, [onStatusChange]);
    const onInitialFileLoadResultChangeCb = useCallback(onInitialFileLoadResultChange, [onInitialFileLoadResultChange]);

    //Callback to run when a file is added to Uppy
    const fileAddedHandler = useCallback((_file: UppyFile) => {
      onStatusChangeCallback("uploads processing");
      onValueChangeCallback(formatValues(uppy?.getFiles()));
    }, [uppy, onStatusChangeCallback, onValueChangeCallback]);

    //Callback for when a file is removed from Uppy
    const fileRemovedHandler = useCallback(async (file: UppyFile, reason: string) => {

      //Get the current files from Uppy
      const files = uppy?.getFiles();

      //We remove the file from Uppy instantly and run the delete API call in the background
      //Reason: we shouldn't force users to wait for file deletion and we won't force them to care about deletion errors
      onValueChangeCallback(formatValues(files));

      //If there are no more files left, set status back to "No file uploaded yet"
      //Otherwise, the status is unchanged
      //Note that Uppy does not consider itself to be In Progress during file removal, and we are OK with this
      if(!files || files.length === 0) {
        onStatusChangeCallback("empty");
      }

      //Determine if it's appropriate to run the API call to delete the file from Supabase Storage
      const shouldDelete = 
        reason === "removed-by-user" &&
        deleteFromSupabaseStorageOnRemove &&
        //Only delete if the file has been uploaded successfully previously, otherwise it may be a failed upload due to file named same already existing on server
        file.progress?.uploadComplete;

      //Delete file from Supabase if appropriate (without waiting for result or telling the user about errors)
      if (shouldDelete) {
        try {
          await deleteFileFromSupabaseStorage(bucketName, file.meta.objectName as string);
        } catch(err) {
          //We don't do anything useful with the error here because we aren't making the user wait for deletion or fix errors
          console.log('error from supabase in file removal', err)
        }
      }
    }, [bucketName, deleteFromSupabaseStorageOnRemove, uppy, onValueChangeCallback, onStatusChangeCallback]);

    //Callback for when Uppy has completed uploading files (whether successful or not)
    const completeHandler = useCallback((_result: UploadResult) => {
      onValueChangeCallback(formatValues(uppy?.getFiles()));
      onStatusChangeCallback("uploads complete");
    }, [uppy, onValueChangeCallback, onStatusChangeCallback]);

    //Callback to run when various processing events occur in Uppy
    const runOnvalueChangeCallback = useCallback(() => {
      onValueChangeCallback(formatValues(uppy?.getFiles()));
    }, [uppy, onValueChangeCallback]);

    //SETUP UPPY ON INITIAL RENDER
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

        setUppy(uppy)

      });

    }, [])

    //Once uppy is Initialized, download initial files from Supabse and add to the Uppy instance
    //But only do this ONCE
    useEffect(() => {

      //Uppy not Initialized, so do nothing
      if(!uppy) return;

      //The component is already ready (we've run this before), so do nothing
      if(ready === true) return;

      //There's no initial files to download, so set ready and do nothing
      if(!initialFilePathsState) {
        setReady(true);
        return;
      }

      //There is initial files to download from Supabase
      //Do that and then set ready
      downloadFilesFromSupabaseAndAddToUppy(initialFilePathsState, uppy, bucketName, folder)
      .then((result) => {
        console.log('result', result)
        // setInitialFilesResult(result);
        onInitialFileLoadResultChangeCb(result);
        if(result.length > 0 && result.some(file => file.downloadSucceeded)) {
          // setStatus("initial files loaded");
          onStatusChangeCallback("initial files loaded");
          // setValue(formatValues(uppy.getFiles()));
          onValueChangeCallback(formatValues(uppy.getFiles()));
        }
        setReady(true);
      });

    }, [uppy, initialFilePathsState, bucketName, folder, reset, ready, onValueChangeCallback, onInitialFileLoadResultChangeCb, onStatusChangeCallback]);

    //Before a file is added to Uppy, setup Supabase metatadata (which is needed for upload to supabase via Tus plugin)
    //Optionally help manage duplicate file conflicts by doing one of the following (as specified by user):
    //-Add a unique ID in front of the filename OR
    //-Add each file to a unique subfolder
    useEffect(() => {
      uppy?.setOptions({
        onBeforeFileAdded: (file) => {

          //Get the original ID generated by Uppy for ths new file
          const originalIdFromUppy = file.id;

          //Check there's no IDENTICAL file already in the instace of the Uppy uploader
          //This normally happens automatically in Uppy based on Uppy's generated file.id (which will be the same for identical files from the same source)
          //However, we sometimes must modify file.id below for other reasons
          //When we modify file.id, we store the original in file.meta.originalIdFromUppy
          //Therefore, to prevent IDENTICAL files in same instance of Uppy, we do this check manually using file.meta.originalIdFromUppy
          const identicalFileAlreadyInUppy = uppy.getFiles().some(file => file.meta.originalIdFromUppy === originalIdFromUppy);
          if(identicalFileAlreadyInUppy){
            uppy.info('You have already added this file, so we skipped it. If you need to re-upload the file, remove it first then try again.', 'error', 3000);
            return false;
          }

          //Generate a uid
          const uid = uuid();

          //Setup the common file metadata for Supabase (that is the same between all options below)
          const commonSupabaseMeta = {
            bucketName: bucketName,
            contentType: file.type,
          }

          if(avoidNameConflicts === "None" || !avoidNameConflicts) {
            //When not adding any UID to the filename
            //Prepare the file object for Uppy
            const modifiedFile = {
              //The normal file data
              ...file,
              //Add more file metadata
              meta: {
                //The original metadata
                ...file.meta,
                //Common supabaseMeta data
                ...commonSupabaseMeta,
                //Objectname for Supabase based on folder and filename
                objectName: folder ? `${folder}/${file.name}` : `${file.name}`,
                //The original ID for this file as generated by Uppy (even though we didn't modify it in this scenario)
                originalIdFromUppy: originalIdFromUppy,
              }
            }
            return modifiedFile;

          } else if (avoidNameConflicts === "Uid in front of filename") {
            //When adding a UID in front of the file name

            //Generate the modified filename
            const fileName = `${uid}_${file.name}`;

            //Prepare the file object for Uppy
            const modifiedFile = {
              //The normal file data
              ...file,
              //Modify the Uppy-generated file.id to our UID
              id: uid,
              //Modify the file name to include our UID
              name: fileName,
              //Add file metadata
              meta: {
                //The original metadata
                ...file.meta,
                //Add the common supabase metadata
                ...commonSupabaseMeta,
                //Objectname for Supabase based on folder and our uid_filename
                objectName: folder ? `${folder}/${fileName}` : `${fileName}`,
                //Another place we must set our modified filename
                name: `${fileName}`,
                //Store the original ID generated by Uppy
                originalIdFromUppy: originalIdFromUppy,
              }
            }
            return modifiedFile;

          } else if (avoidNameConflicts === "Each file in unique subfolder") {
            //When adding each file to a unique subfolder

            //Generate our final path within the bucket and optional folder specified by props
            //Adding a subfolder with the UID
            const folderFinal = folder ? `${folder}/${uid}` : uid;
            const pathFinal = `${folderFinal}/${file.name}`;

            //Prepare the file object for Uppy
            const modifiedFile = {
              //The normal file data
              ...file,
              //Modify the Uppy-generated file.id to our UID
              id: uid,
              //Add file metadata
              meta: {
                //The original metadata
                ...file.meta,
                //Add the common supabase metadata
                ...commonSupabaseMeta,
                //Objectname for Supabase based on our final path including uid folder
                objectName: pathFinal,
                //Store the original ID generated by Uppy
                originalIdFromUppy: originalIdFromUppy,
              },
            }
            return modifiedFile;
          }
        }
      })
    }, [uppy, bucketName, folder, avoidNameConflicts])

    //When various option props change, update the Uppy instance with the new options
    useEffect(() => {
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
    }, [uppy, fileAddedHandler, fileRemovedHandler, completeHandler, runOnvalueChangeCallback]);

    //When dashboard options change, reset the Uppy instance
    //Reason: the props changing do not otherwise show up until unmount and re-initializing of the component
    //which is bad UX in Plasmic studio, because live updates to those props are therefore not visible as user changes them
    useEffect(() => {
      setReset(Math.random());
      setReady(false);
    }, [width, height, theme, showDoneButton, showProgressDetails, showRemoveButtonAfterComplete]);

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
            setReady(false);
          },
          reset: () => {
            setReset(Math.random());
            setReady(false);
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
      description: "The name of the supabase storage bucket to upload to. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
    },
    folder: {
      type: "string",
      description: "The folder within the bucket to upload to (leave blank if you want to upload to the root of the bucket). Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic"
    },
    avoidNameConflicts: {
      type: "choice",
      defaultValue: "Each file in unique subfolder",
      options: ["Each file in unique subfolder", "Uid in front of filename", "None"],
      description: "Whether to add a unique ID in front of the filename before uploading to Supabase Storage. This is useful to prevent conflicts if users upload files with the same name.",
    },
    initialFilePaths: {
      type: 'array',
      description: 'Initial file paths that are already uploaded to pre-populate the Uploader with. These must be within the root path specified in SupabaseStorageProvider (bucketname and folder). Eg if SupabaseStorageProvider props bucketName = "someBucket" and folder = "someFolder", you could provide value here of ["file1.jpg", "anotherFolder/file2.jpg"] to populate the uploader with initial files someBucket/someFolder/file1.jpg and someBucket/someFolder/anotherFolder/file2.jpg',
    },
    theme: {
      type: "choice",
      defaultValue: "light",
      options: ["light", "dark", "auto"],
      description: "The theme (light or dark) of the Uppy uploader dashboard. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic"
    },
    showDoneButton: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show the done button in the Uppy uploader dashboard. You can define what happens when the done button is clicked by adding an interaction action 'onDoneButtonClick'. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
    },
    width: {
      type: "number",
      description: "The width of the Uppy uploader dashboard in px. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
    },
    height: {
      type: "number",
      description: "The height of the Uppy uploader dashboard in px. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
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
        "Whether to show progress details in the Uppy uploader dashboard. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
    },
    showRemoveButtonAfterComplete: {
      type: "boolean",
      defaultValue: true,
      description:
        "Whether to show the remove button after a file has been uploaded. Warning: changing this propr will cause Uppy to re-initialize. Avoid making it dynamic",
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
      onChangeProp: 'onValueChange',
      initVal: {
        "rawFilesData": [],
        "numSucceeded": 0,
        "numFailed": 0,
        "numAnyStatus": 0,
        "successfulFiles": []
      },
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
    },
    reset: {
      description: "Reset the Uppy instance.",
      argTypes: [],
    }
  },
  importPath: "./index",
};
