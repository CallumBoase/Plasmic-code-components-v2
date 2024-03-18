//React
import { useState, useEffect } from "react";

//Filepond
import { FilePond, registerPlugin } from "react-filepond";
import type {
  ActualFileObject,
  FilePondInitialFile,
  ProcessServerConfigFunction,
  RevertServerConfigFunction,
} from "filepond";
import "filepond/dist/filepond.min.css";

//Filepond plugins
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

//Supabase storage methods
import { uploadFile } from '@/components/SupabaseStorage/Methods/uploadFile';

//Utils
import getErrMsg from "@/utils/getErrMsg";

//Register the Filepond plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFileValidateSize
);

type Props = {
  files: any;
  onUpdateFiles: (files: any) => string;
  className: string;
  required: boolean;
  allowMultiple: boolean;
  maxFiles: number;
  maxFileSize: string | null | undefined;
};

export const SupabaseFileUploader = ({ files, onUpdateFiles, className, required, allowMultiple, maxFiles, maxFileSize }: Props) => {

  return (
    <div className={className}>
      <FilePond 
        required={required}
        files={files}

        onupdatefiles={(fileItems) => {
          const fileItemMetaDataWithoutFile = fileItems.map((fileItem) => {
            //Return metadata of the fileItem without the actual file
            //This is to avoid passing around large File objects and to avoid infinite re-render caused by the File object
            //Other ways of picking the relevant properties of fileItem object seem to result in an empty object in Plasmic Studio for some reason
            //So we do it manually here
            //Structure of the fileItem object: https://pqina.nl/filepond/docs/api/file-item/
            return {
              id: fileItem.id,
              serverId: fileItem.serverId,
              origin: fileItem.origin,
              status: fileItem.status,
              fileExtension: fileItem.fileExtension,
              fileSize: fileItem.fileSize,
              filename: fileItem.filename,
              filenameWithoutExtension: fileItem.filenameWithoutExtension,
            }
          });
          onUpdateFiles(fileItemMetaDataWithoutFile);
        }}
        allowMultiple={allowMultiple}
        maxFiles={maxFiles}
        maxFileSize={maxFileSize}
        credits={false}
        server={{
          process: (_fieldName, file, _metadata, load, error, _progress, abort, _transfer, _options) => {
            
            const path = `fromFilepond/${file.name}`;
            const contentType = file.type;
            const upsert = false;
        
            uploadFile("temp_public", path, file, contentType, upsert)
              .then((response) => {
                load(response.data);
              })
              .catch((err) => {
                error(getErrMsg(err));
              });
            
          
            return {
              abort: () => {
                abort();
              },
            };
          },          
          revert: null,
          restore: null,
          load: null,
          fetch: null,
        }}
      />
    </div>
  );
};

export const registerSupabaseFileUploader = {
  name: "SupabaseFileUploader",
  props: {
    files: "object",
    required: {
      type: "boolean",
      default: false,
    },
    allowMultiple: {
      type: "boolean",
      default: false,
    },
    maxFiles: {
      type: "number",
      default: 1,
    },
    maxFileSize: {
      type: "string",
      default: "10mb",
    },
    onUpdateFiles: {
      type: "eventHandler",
      argTypes: [
        {
          name: "files",
          type: "object",
        },
      ],
    }
  },
  states: {
    files: {
      type: "writable",
      variableType: "object",
      valueProp: "files",
      onChangeProp: "onUpdateFiles",
    },
  },
};
