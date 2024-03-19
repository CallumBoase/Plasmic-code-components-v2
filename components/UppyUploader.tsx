import React, { useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

export function UppyUploader() {
  // IMPORTANT: passing an initializer function to prevent Uppy from being reinstantiated on every render.
  const [uppy] = useState(() => new Uppy());

  return <Dashboard 
    uppy={uppy} plugins={["Webcam"]} 
    inline={true}
    limit={10}
    showProgressDetails={true}
    showRemoveButtonAfterComplete={true}
  />;
}

export const UppyUploaderRegistration = {
  name: "UppyUploader",
  props: {},
  states: {},
};
