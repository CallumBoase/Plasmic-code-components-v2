import React, { useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import Tus from "@uppy/tus";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5cG14Y2J1aHdwdWt6bW94aGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQwNTExNjksImV4cCI6MjAwOTYyNzE2OX0.t_awsVzBc-Nyoe6ZfYTVZ-CCCQXmRVYuSmoUNJGim_Q";
const SUPABASE_PROJECT_ID = "gypmxcbuhwpukzmoxhds";
const STORAGE_BUCKET = "temp_public";
const BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsImtpZCI6IjYyWEd4RUsxY09ZVFBGcmIiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzEwODI1ODEyLCJpYXQiOjE3MTA4MjIyMTIsImlzcyI6Imh0dHBzOi8vZ3lwbXhjYnVod3B1a3ptb3hoZHMuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjdhNDFkNTYxLWI1OTYtNGI2MS04NjBjLTY5MDhhMGYxYTU3OSIsImVtYWlsIjoiY2FsbHVtLmJvYXNlQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzEwODIyMjEyfV0sInNlc3Npb25faWQiOiJiMjFiNzYyMS00M2FkLTQ4NDAtOGMwMC00NmZmOWJlYTFiMTMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.URpNn_NP0D79YyEWlU_0jnDlcO54lCqPttvPYHThIiI"

const folder = "fromUppy";
const supabaseStorageURL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/upload/resumable`;

var uppy = new Uppy()
  // .use(Dashboard, {
  //   inline: true,
  //   limit: 10,
  //   target: "#drag-drop-area",
  //   showProgressDetails: true,
  //   showRemoveButtonAfterComplete: true,
  // })
  .use(Tus, {
    endpoint: supabaseStorageURL,
    headers: {
      authorization: `Bearer ${BEARER_TOKEN}`,
      apikey: SUPABASE_ANON_KEY,
    },
    uploadDataDuringCreation: true,
    chunkSize: 6 * 1024 * 1024,
    allowedMetaFields: [
      "bucketName",
      "objectName",
      "contentType",
      "cacheControl",
    ],
    // onError: function (error) {
    //   console.log("Failed because: " + error);
    // },
  });

uppy.on("file-added", (file) => {
  const supabaseMetadata = {
    bucketName: STORAGE_BUCKET,
    objectName: folder ? `${folder}/${file.name}` : file.name,
    contentType: file.type,
  };

  file.meta = {
    ...file.meta,
    ...supabaseMetadata,
  };

  console.log("file added", file);
});

uppy.on("complete", (result) => {
  console.log(
    "Upload complete! We’ve uploaded these files:",
    result.successful
  );
  console.log(result);
});

//Not yet working
uppy.on("file-removed", (file, reason) => {
  if (reason === "removed-by-user") {
    console.log("file removed by user", file);
    //Send delete request using supabasejs
  }
});

export function UppyUploader() {
  // // IMPORTANT: passing an initializer function to prevent Uppy from being reinstantiated on every render.
  // const uppy = useUppy(() => {
  //   return new Uppy().use(Tus, { endpoint: "https://tusd.tusdemo.net/files/"})
  // })

  uppy.setOptions({
    restrictions: {
      maxNumberOfFiles: 10,
      minNumberOfFiles: 1,
    },
  })

  return (
    <Dashboard
      uppy={uppy}
      showProgressDetails={true}
      showRemoveButtonAfterComplete={true}
    />
  );
}

export const UppyUploaderRegistration = {
  name: "UppyUploader",
  props: {},
  states: {},
};
