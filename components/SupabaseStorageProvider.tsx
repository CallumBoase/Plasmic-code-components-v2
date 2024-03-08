import { DataProvider } from "@plasmicapp/loader-nextjs";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import createClient from "@/utils/supabase/component";
import { decode } from "base64-arraybuffer";
import getErrMsg from "@/utils/getErrMsg";
import { v4 as uuidv4 } from "uuid";
import { FileObject as SupabaseStorageFileObject } from "@supabase/storage-js/dist/main/lib/types";

//Type declarations
interface FileData {
  name: string;
  contents: string; //TBA
  type: string;
}

interface SupabaseStorageProviderProps {
  children: React.ReactNode;
  className?: string;
  instanceName: string;
  bucketName: string;
}

interface SupabaseStorageUploadResult {
  path: string;
}

interface SupabaseMoveFileResult {
  message: string;
}

type SupabaseDeleteFilesResult = SupabaseStorageFileObject[];

interface Actions {
  uploadFile(
    path: string,
    base64FileData: string,
    contentType: string,
    upsert: boolean
  ): void;
  uploadManyFiles(
    fileDataList: FileData[],
    folder: string,
    upsert: boolean,
    replaceFilename: boolean
  ): void;
  downloadFile(path: string, optimization: boolean): void;
  replaceFile(
    path: string,
    base64FileData: string,
    contentType: string,
    upsert: boolean
  ): void;
  moveFile(fromPath: string, toPath: string): void;
  copyFile(fromPath: string, toPath: string): void;
  deleteFiles(paths: string[]): void;
  listFiles(
    path: string,
    limit: number,
    offset: number,
    sortBy: string,
    search: string
  ): void;
  emptyBucket(): void;
}

interface UploadManyResult {
  input: { filename: string };
  target: {
    path: string;
    type: string;
  };
  result: {
    status: string;
    data: null | SupabaseStorageUploadResult;
    error: any;
  };
}

type DataState =
  | null
  | Blob
  | SupabaseStorageUploadResult
  | UploadManyResult[]
  | SupabaseMoveFileResult
  | SupabaseDeleteFilesResult;

//The SupabaseStorageProvider component
export const SupabaseStorageProvider = forwardRef<
  Actions,
  SupabaseStorageProviderProps
>(function SupabaseStorageProvider(props, ref) {
  const { children, className, instanceName, bucketName } = props;

  // setup state
  const [data, setData] = useState<DataState>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // DEFINE FUNCTIONS TO HANDLE SUPABASE STORAGE API CALLS TO BE USED IN ELEMENT ACTIONS

  //Upload a file to Supabase Storage
  const uploadFile = useCallback(
    async (
      path: string,
      base64FileData: string,
      contentType: string,
      upsert: boolean
    ) => {
      const supabase = createClient(); // establish the Supabase client

      let options = Object.assign(
        {},
        contentType && { contentType: contentType }, //currently, we let the client specify the MIME-type. As it stands, if the client is manipulated, a user could upload a different file type to the MIME type they specify, circumventing Supabase file type restrictions. In future, it is suggested to derive the MIME-type in the backend.
        upsert && { upsert: upsert }
      );

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(path, decode(base64FileData), options);
      if (error) {
        throw error;
      }
      setData(data);
    },
    [bucketName]
  );

  //Upload multiple files to Supabase storage
  const uploadManyFiles = useCallback(
    async (
      fileDataList: FileData[],
      folder: string,
      upsert: boolean,
      replaceFilename: boolean
    ) => {
      const supabase = createClient();
      const uploadResults = [];

      //Run each upload in a loop
      for (const file of fileDataList) {

        //Get the file name, separating it from the folder path if necessary
        let path = folder + "/" + (replaceFilename ? uuidv4() : file.name);

        //Create the result item which we will populate later
        let resultItem: UploadManyResult = {
          input: { filename: file.name },
          target: {
            path: path,
            type: file.type,
          },
          result: {
            status: "",
            data: null,
            error: null,
          },
        };

        //Configure the options for the upload based on user input into Plasmic Studio
        let options = Object.assign(
          {},
          file.type && { contentType: file.type },
          upsert && { upsert: upsert }
        );

        //Upload a single file, catching errors and populating the result item with them if they occur
        try {
          const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(path, decode(file.contents), options);
          if (error) throw new Error(getErrMsg(error));

          resultItem.result.status = "success";
          resultItem.result.data = data;
        } catch (err) {
          resultItem.result.status = "error";
          resultItem.result.error = getErrMsg(err);
        }

        uploadResults.push(resultItem);
      }
      setData(uploadResults);

      const allErrorResults = uploadResults.filter(i => i.result.status === "error")
      const joinedErrorMessages = allErrorResults.map(i => i.result.error).join("\n");
      setError(`${allErrorResults.length} files failed to upload: \n ${joinedErrorMessages}`);

    },
    [bucketName]
  );

  // Download a file
  // Downloads a file from a private bucket. For public buckets, make a request to the URL returned from getPublicUrl instead.
  const downloadFile = useCallback(
    async (path: string, optimization: boolean) => {
      const supabase = createClient(); // establish the Supabase client

      // Define the Format type - origin or null depending on the optimization boolean
      type Format = "origin" | null;
      const format: Format = optimization ? null : "origin"; // Specify the format of the image requested. When using 'origin' we force the format to be the same as the original image. When this option is not passed in, images are optimized to modern image formats like Webp.

      // Conditionally setting the transform property if format is not falsy
      let transform = format ? { format: format } : undefined;

      // Ensuring options is of the correct type or undefined
      let options = transform ? { transform: transform } : undefined;

      //Get the file name, separating it from the folder path if necessary
      let filename = path.includes("/")
        ? path.substring(path.lastIndexOf("/") + 1)
        : path;

      // Download the file from Supabase storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(path, options);
      if (error) {
        throw error;
      }

      setData(data);

      // Initiate the download of the file via hidden <a> tag
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      var url = window.URL.createObjectURL(data);
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    [bucketName]
  );

  // Replace an existing file
  // Replaces an existing file at the specified path with a new one.
  const replaceFile = useCallback(
    async (
      path: string,
      base64FileData: string,
      contentType: string,
      upsert: boolean
    ) => {
      const supabase = createClient(); // establish the Supabase client

      let options = Object.assign(
        {},
        contentType && { contentType: contentType },
        upsert && { upsert: upsert }
      );

      const { data, error } = await supabase.storage
        .from(bucketName)
        .update(path, decode(base64FileData), options);
      if (error) {
        throw error;
      }
      setData(data);
    },
    [bucketName]
  );

  // Move an existing file
  // Moves an existing file to a new path in the same bucket.
  const moveFile = useCallback(
    async (fromPath: string, toPath: string) => {
      const supabase = createClient(); // establish the Supabase client

      const { data, error } = await supabase.storage
        .from(bucketName)
        .move(fromPath, toPath);
      if (error) {
        throw error;
      }
      setData(data);
    },
    [bucketName]
  );

  // Copy an existing file
  // Copies an existing file to a new path in the same bucket.
  const copyFile = useCallback(
    async (fromPath: string, toPath: string) => {
      const supabase = createClient(); // establish the Supabase client

      const { data, error } = await supabase.storage
        .from(bucketName)
        .copy(fromPath, toPath);
      if (error) {
        throw error;
      }
      setData(data);
    },
    [bucketName]
  );

  // Delete files in a bucket
  // Deletes specified files within the same bucket
  const deleteFiles = useCallback(
    async (paths: string[]) => {
      const supabase = createClient(); // establish the Supabase client

      const { data, error } = await supabase.storage
        .from(bucketName)
        .remove(paths);
      if (error) {
        throw error;
      }
      if (data.length == 0) {
        throw new Error(
          "File does not exist or you are not authorized to delete it."
        );
      }
      setData(data);
    },
    [bucketName]
  );

  // List all files in a bucket
  // Lists all the files within a bucket
  const listFiles = useCallback(
    async (
      path: string,
      limit: number,
      offset: number,
      sortBy: any,
      search: string
    ) => {
      const supabase = createClient(); // establish the Supabase client

      let options = Object.assign(
        {},
        limit && { limit: limit },
        offset && { offset: offset },
        sortBy && { sortBy: sortBy },
        search && { search: search }
      );

      console.log("Options: " + JSON.stringify(options));

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(path, options);
      if (error) {
        throw error;
      }
      setData(data);
    },
    [bucketName]
  );

  // Empty a bucket
  // Removes all objects inside a single bucket
  const emptyBucket = useCallback(async () => {
    const supabase = createClient(); // establish the Supabase client

    const { data, error } = await supabase.storage.emptyBucket(bucketName);
    if (error) {
      throw error;
    }
    setData(data);
  }, [bucketName]);

  // DEFINE ELEMENT ACTIONS THAT CALL THE API FUNCTIONS
  useImperativeHandle(ref, () => ({

      uploadFile: (path, base64FileData, contentType, upsert) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        uploadFile(path, base64FileData, contentType, upsert)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      uploadManyFiles: (
        fileDataList,
        folder,
        upsert,
        replaceFilename
      ) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        uploadManyFiles(fileDataList, folder, upsert, replaceFilename)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      downloadFile: (
        path,
        optimization
        //These props are deliberately ommitted because they are in beta and/or only supported by supabase pro/enterprise plan
        // height,
        // width,
        // quality,
        // resizeMode
      ) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        downloadFile(path, optimization)
          // Alt downloadFile function with additional parameters for image optimization if desired
          // downloadFile(path, optimization, height, width, quality, resizeMode)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      replaceFile: (path, base64FileData, contentType, upsert) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        replaceFile(path, base64FileData, contentType, upsert)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      moveFile: (fromPath, toPath) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        moveFile(fromPath, toPath)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      copyFile: (fromPath, toPath) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        copyFile(fromPath, toPath)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      deleteFiles: (paths) => {
        setIsLoading(true);
        setData(null);
        setError(null);
        deleteFiles(paths)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      listFiles: (path, limit, offset, sortBy, search) => {
        console.log(limit);
        setIsLoading(true);
        setData(null);
        setError(null);
        listFiles(path, limit, offset, sortBy, search)
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },

      emptyBucket: () => {
        setIsLoading(true);
        setData(null);
        setError(null);
        emptyBucket()
          .catch((err) => setError(getErrMsg(err)))
          .finally(() => {
            setIsLoading(false);
          });
      },
  }));

  return (
    <div className={className}>
      <DataProvider
        name={instanceName || "SupabaseStorageProvider"}
        data={{
          data: data,
          error: error,
          isLoading: isLoading,
        }}
      >
        {children}
      </DataProvider>
    </div>
  );
});
