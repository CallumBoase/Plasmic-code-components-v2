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

  console.log('render')
  // const [files, setFiles] = useState<ActualFileObject[]>([]);
  // const [files, setFiles] = useState<any>([]);

  // console.log(files.map((file) => file.name));

  // useEffect(() => {
  //   onUpdateFiles(files);
  // }
  // , [onUpdateFiles, files]);

  return (
    <div className={className}>
      {/* <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      /> */}
      <FilePond 
        required={required}
        files={files}

        onupdatefiles={(fileItems) => {
          const fileItemMetaDataWithoutFile = fileItems.map((fileItem) => {
            //Return metadata of the fileItem without the actual file
            //This is to avoid passing around large File objects and to avoid infinite re-render
            //Other ways of desctructuring the fileItem object seem to result in an empty object for some reason
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
