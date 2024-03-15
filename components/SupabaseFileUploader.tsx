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
        onupdatefiles={(fileItems) => onUpdateFiles(fileItems.map(fileItem => {
          return {
            id: fileItem.id,
            serverId: fileItem.serverId,
            origin: fileItem.origin,
            status: fileItem.status,
            fileExtension: fileItem.fileExtension,
            fileSize: fileItem.fileSize,
            filename: fileItem.filename,
            filenameWithoutExtension: fileItem.filenameWithoutExtension,
            file: fileItem.file,//THis line causes infinite render loop!
          }
        }))}
        // onupdatefiles={(fileItems) => {
        //   return onUpdateFiles(fileItems.map((fileItem) => fileItem.file));
        //   // const files = fileItems.map((fileItem) => fileItem.file);
        //   // setFiles(files);
        //   //return onUpdateFiles(files);
        // }}
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
