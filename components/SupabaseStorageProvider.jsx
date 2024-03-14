import { useState } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { DataProvider } from "@plasmicapp/loader-nextjs";
import createClient from '@/utils/supabase/component';
import { decode } from "base64-arraybuffer";
import getErrMsg from '../utils/getErrMsg';
import { v4 as uuidv4 } from 'uuid';


export const SupabaseStorageProvider = forwardRef(function SupaStorageProvider(props, ref) {

  const { children, instanceName, bucketName } = props;

  const [value, setValue] = useState('initial');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null)

  //console.log('component render, value is:', value)

  // DEFINE HELPER FUNCTIONS TO HANDLE SUPABASE STORAGE API CALLS TO BE USED IN ELEMENT ACTIONS
  // RETURNS VALUE
  // DOES NOT SET STATE

  // Upload a file
  // Uploads a file to an existing bucket.
  const uploadFile = async (path, base64FileData, contentType, upsert) => {

    const supabase = createClient(); // establish the Supabase client

    // build an object with only the options that have actually been set
    let options = Object.assign({},
      contentType && { contentType: contentType }, //currently, we let the client specify the MIME-type. As it stands, if the client is manipulated, a user could upload a different file type to the MIME type they specify, circumventing Supabase file type restrictions. In future, it is suggested to derive the MIME-type in the backend.
      upsert && { upsert: upsert }
    )
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .upload(
        path, 
        decode(base64FileData),
        options
    )
    if (errorResponse) throw errorResponse

    return { data: dataResponse, error: errorResponse };
  }

  const downloadFile = async (path, optimization) => {

    const supabase = createClient(); // establish the Supabase client

    const format = optimization ? null : "origin"; // Specify the format of the image requested. When using 'origin' we force the format to be the same as the original image. When this option is not passed in, images are optimized to modern image formats like Webp.

    //define the transform object if there are transformations set
    let transform = Object.assign({},
        format && { format: format }
    )
    
    //define the options object if there are transformations or other options set. 
    let options = Object.assign({},
        transform &&
        Object.keys(transform).length !== 0 &&
        transform.constructor === Object && 
        { transform: transform }
    )
    
    let filename = path.includes("/") ? path.substring(path.lastIndexOf('/') + 1) : path
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .download(
        path, 
        options
    )

    const size = dataResponse.size
    const type = dataResponse.type

    if (errorResponse) throw errorResponse

    var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
                var url = window.URL.createObjectURL(dataResponse);
                a.href = url;
                a.download = filename;
                a.click();
                window.URL.revokeObjectURL(url); 

    return { data: {size, type}, error: errorResponse }; // we don't return the original dataResponse as it is a Blob which are handled differently to JS objects
  }

  // Upload multiple files
  // Uploads a list of files to an existing bucket.
  const uploadManyFiles = async (fileDataList, folder, upsert, replaceFilename) => {

    const supabase = createClient(); // establish the Supabase client
    const uploadResults = []

    for (const file of fileDataList) {

      let path = folder + "/" + (replaceFilename ? uuidv4() : file.name);
      let resultItem = {
          input: { filename: file.name },
          target: {
              path: path,
              type: file.type
          },
          result: {
              status: "",
              data: null,
              error: null
          }
      };

      // build an object with only the options that have actually been set
      let options = Object.assign({},
        file.type && { contentType: file.type },
        upsert && { upsert: upsert }
      )
    
     try {
        const { data: dataResponse, error: errorResponse } = await supabase
        .storage
        .from(bucketName)
        .upload(
            path, 
            decode(file.contents),
            options
        )
        if (errorResponse) {
          throw errorResponse
        }

        resultItem.result.status = "success";
        resultItem.result.data = dataResponse;

      } catch (itemError) {
        resultItem.result.status = "error";
        resultItem.result.error = getErrMsg(itemError);
      }
      uploadResults.push(resultItem)
      
    }
    return { data: uploadResults };
  }

  // Replace an existing file
  // Replaces an existing file at the specified path with a new one.
  const replaceFile = async (path, base64FileData, contentType, upsert) => {

    const supabase = createClient(); // establish the Supabase client

    // build an object with only the options that have actually been set
    let options = Object.assign({},
      contentType && { contentType: contentType }, //currently, we let the client specify the MIME-type. As it stands, if the client is manipulated, a user could upload a different file type to the MIME type they specify, circumventing Supabase file type restrictions. In future, it is suggested to derive the MIME-type in the backend.
      upsert && { upsert: upsert }
    )
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .update(
        path, 
        decode(base64FileData), 
        options
    )
    if (errorResponse) throw errorResponse

    return { data: dataResponse, error: errorResponse };
  }

  // Move an existing file
  // Moves an existing file to a new path in the same bucket.
  const moveFile = async (fromPath, toPath) => {

    const supabase = createClient(); // establish the Supabase client
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .move(
        fromPath, 
        toPath
    )
    if (errorResponse) throw errorResponse

    return { data: dataResponse, error: errorResponse };
  }

  // Copy an existing file
  // Copies an existing file to a new path in the same bucket.
  const copyFile = async (fromPath, toPath) => {

    const supabase = createClient(); // establish the Supabase client
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .copy(
        fromPath, 
        toPath
    )
    if (errorResponse) throw errorResponse

    return { data: dataResponse, error: errorResponse };
  }

  // Delete files in a bucket
  // Deletes specified files within the same bucket
  const deleteFiles = async (paths) => {

    const supabase = createClient(); // establish the Supabase client
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .remove(
        paths
    )
    if (errorResponse) throw errorResponse
    if (dataResponse.length == 0) {
      throw new Error('File does not exist or you are not authorized to delete it.')
    }

    return { data: dataResponse, error: errorResponse };
  }

  // List all files in a bucket
  // Lists all the files within a bucket
  const listFiles = async (path, limit, offset, sortBy, search) => {

    const supabase = createClient(); // establish the Supabase client

    let options = Object.assign({},
      limit && { limit: limit },
      offset && { offset: offset },
      sortBy && { sortBy: sortBy },
      search && { search: search }
    )
    
    const { data: dataResponse, error: errorResponse } = await supabase
    .storage
    .from(bucketName)
    .list(
        path, 
        options
    )
    if (errorResponse) throw errorResponse

    return { data: dataResponse, error: errorResponse };
  }


  // DEFINE ELEMENT ACTIONS THAT CALL THE API HELPER FUNCTIONS
  // STATE IS SET HERE (eventual) AND VALUES RETURNED (immediate - for use in $steps)
  useImperativeHandle(
    ref,
    () => {
      return {

        //Element actions to run in plasmic studio
        //Handles error and sets state too

        uploadFile: async (path, base64FileData, contentType, upsert) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await uploadFile(path, base64FileData, contentType, upsert);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        uploadManyFiles: async (fileDataList, folder, upsert, replaceFilename) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await uploadManyFiles(fileDataList, folder, upsert, replaceFilename);
            const errors = result.data.filter(i => i.result.error !== null);
            if(errors.length) {
              const errorString = errors.map(i => i.result.error);
              console.log(errors)
              console.log(errorString)
              throw new Error(errorString);
            }
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(getErrMsg(err));
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        downloadFile: async (path, optimization) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await downloadFile(path, optimization);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        replaceFile: async (path, base64FileData, contentType, upsert) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await replaceFile(path, base64FileData, contentType, upsert);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        moveFile: async (fromPath, toPath) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await moveFile(fromPath, toPath);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        copyFile: async (fromPath, toPath) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await copyFile(fromPath, toPath);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        deleteFiles: async (paths) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await deleteFiles(paths);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(getErrMsg(err));
            setValue(null);
            return { data: null, error: getErrMsg(err)};
          } finally {
            setIsLoading(false)
          }
        },

        listFiles: async (path, limit, offset, sortBy, search) => {
          setIsLoading(true)
          setValue(null)
          setError(null)
          try {
            const result = await listFiles(path, limit, offset, sortBy, search);
            setError(result.error);
            setValue(result.data);
            return result; // already in the shape of {data, error}
          } catch (err) {
            setError(err);
            setValue(null);
            return { data: null, error: err};
          } finally {
            setIsLoading(false)
          }
        },

        
      };
    },
  );
  return (
    <DataProvider 
      name={instanceName}
      data={{
        data: value,
        error: error,
        isLoading: isLoading
      }}
    >
      {children}
    </DataProvider>
  );
});

export const RegisterSupabaseStorageProvider = {
  name: "SupabaseStorageProvider",
  providesData: true,
  props: {
    children: {
      type: "slot",
      defaultValue: [
        {
          type: "text",
          value:
            `INSTRUCTIONS FOR SUPABASE STORAGE PROVIDER:
            1. Click the new "Supabase Storage Provider" component in the Component tree (left side of screen) to open its settings
            2. In settings on the right side of screen, choose a globally unique "Instance name" (eg "/storage/things"). This name helps you identify the component in the data picker.
            3. Enter the "Bucket name" from Supabase that you would like to interact with (eg "things")
            4. On the left side of screen, change the name of 'Supabase Storage Provider' component to match the query name. This name helps you identify the component in the Element Action configuration card.
            5. Delete this placeholder text (from "children" slot). Then add components to "children" and use the dynamic actions/data as you wish! :)`,
        },
      ],
    },
    instanceName: {
      type: "string",
      defaultValue: "Supabase Storage Provider",
      helpText: "Choose a globally unique name. Also update the component name in the component tree to be the same. This helps identify the component in the data picker and interaction setup card."
    },
    bucketName: {
      type: "string",
      defaultValueHint: "e.g. avatars",
      helpText: "Exactly match your Supabase bucket name"
    }
  },
  refActions: {
    uploadFile: {
      displayName: "Upload file",
      description: "Uploads a file to an existing bucket.",
      argTypes: [
        { name: "path", type: "string", displayName: "Upload path (including file name)"},
        { name: "base64FileData", type: "string", displayName: "File data (base64 encoded string)"},
        { name: "contentType", type: "string", displayName: "Content Type / MIME type"},
        { name: "upsert", type: "boolean", displayName: "Allow overwrite (optional). Default = false."}
        // cacheControl property has been intentionally not included
      ]
    },
    uploadManyFiles : {
      displayName: "Upload many files",
      description: "Upload a list of files to an existing bucket (assumes array of objects with shape { name: 'filename.ext', type: 'MIME type', contents: 'base64string'}",
      argTypes: [
        { name: "fileDataList", type: "array", displayName: "Array of objects with shape { name: 'filename.ext', type: 'MIME type', contents: 'base64string'}" }, 
        { name: "folder", type: "string", displayName: "The folder/prefix to store each file in." }, 
        { name: "upsert", type: "boolean", displayName: "Allow overwrite (optional). Default = false." },
        { name: "replaceFilename", type: "boolean", displayName: "Replace filename with UUID"}
      ]
    },
    downloadFile : {
      displayName: "Download file",
      description: "Downloads a file from a private bucket. For public buckets, make a request to the URL returned from 'getPublicUrl' instead or derive the URL.",
      argTypes: [
        { name: "path", type: "string", displayName: "Path and filename to download"},
        { name: "optimization", type: "boolean", displayName: "Automatic image optimization (WebP) (optional). Default = true."},
        // other transform properties have been intentinoally not included as they are currently in beta/require pro or enterprise tier supabase
      ]
    },
    replaceFile : {
      displayName: "Replace existing file",
      description: "Replaces an existing file at the specified path with a new one.",
      argTypes: [
        { name: "path", type: "string", displayName: "Upload path (including file name)"},
        { name: "base64FileData", type: "string", displayName: "File data (base64 encoded string)"},
        { name: "contentType", type: "string", displayName: "Content Type / MIME type"},
        { name: "upsert", type: "boolean", displayName: "Allow overwrite (optional). Default = false."}
      ]
    },
    moveFile : {
      displayName: "Move file to new path",
      description: "Moves an existing file to a new path in the same bucket.",
      argTypes: [
        { name: "fromPath", type: "string", displayName: "From path (including current file name)"},
        { name: "toPath", type: "string", displayName: "To data (including new file name)"},
      ]
    },
    copyFile : {
      displayName: "Copy file to new path",
      description: "Copies an existing file to a new path in the same bucket.",
      argTypes: [
        { name: "fromPath", type: "string", displayName: "From path (including current file name)"},
        { name: "toPath", type: "string", displayName: "To data (including new file name)"},
      ]
    },
    deleteFiles : {
      displayName: "Delete file(s)",
      description: "Deletes specified files within the same bucket",
      argTypes: [
        { name: "paths", type: "array", displayName: "Paths to delete (array of paths, including current file name)"},
      ]
    },
    listFiles: {
      displayName: "List file(s)",
      description: "Lists all the files within a bucket.",
      argTypes: [
        { name: "path", type: "string", displayName: "Folder path (optional)"},
        { name: "limit", type: "number", displayName: "Number of files to return (optional). Default = 100"},
        { name: "offset", type: "number", displayName: "Offset/Starting position (optional). Default = 0" },
        { name: "sortBy", type: "object", displayName: "Sort by column (optional). Object like { column: 'name', order: 'asc' }" },
        { name: "search", type: "string", displayName: "Search string to filter files by (optional)" },
      ]
    },
  },
  importPath: "./components/SupabaseStorageProvider",
  isDefaultExport: false,
  importName: "SupabaseStorageProvider"
};