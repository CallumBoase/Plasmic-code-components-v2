import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

//Custom components
import { SupabaseUser } from "./components/SupabaseUserProvider";
import { SupabaseProvider } from "./components/SupabaseProvider";
import { SupabaseAddRowProvider } from "./components/SupabaseAddRowProvider";
import { SupabaseStorageProvider, RegisterSupabaseStorageProvider } from "./components/SupabaseStorageProvider";
import { SupabaseStorageGetSignedUrl } from "./components/SupabaseStorageGetSignedUrl";
import { PromiseDemo } from "./components/PromisesDemo";
import { MyInput, MyInputRegistration } from "./components/MyInput";
import { PromisesPattern, PromisesPatternRegister } from "./components/PromisesPattern";
import { SupabaseFileUploader, registerSupabaseFileUploader } from "./components/SupabaseFileUploader";
import { UppyUploader, UppyUploaderRegistration } from "./components/UppyUploader";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "j5kwR4gbf2MEZDV6eJXqij",
      token:
        "Pl18l30xNglhCwI6AasBpyByr1md0I50BDEAeCA17435huuiOp5MIXP7aMPzKuQALoImfqDgfsjnypoUI1w",
    },
  ],

  // By default Plasmic will use the last published version of your project.
  // For development, you can set preview to true, which will use the unpublished
  // project, allowing you to see your designs without publishing.  Please
  // only use this for development, as this is significantly slower.
  preview: true,
});

// You can register any code components that you want to use here; see
// https://docs.plasmic.app/learn/code-components-ref/
// And configure your Plasmic project to use the host url pointing at
// the /plasmic-host page of your nextjs app (for example,
// http://localhost:3000/plasmic-host).  See
// https://docs.plasmic.app/learn/app-hosting/#set-a-plasmic-project-to-use-your-app-host

// PLASMIC.registerComponent(...);

PLASMIC.registerComponent(PromiseDemo, {
  name: "PromiseDemo",
  props: {},
  refActions: {
    nonPromise: {
      description: "nonPromise",
      argTypes: [],
    },
    promise: {
      description: "promise",
      argTypes: [],
    },
    whatWeADo: {
      description: "whatWeADo",
      argTypes: [],
    },
  },
});

PLASMIC.registerGlobalContext(SupabaseUser, {
  name: "SupabaseUserGlobalContext",
  props: {
      defaultRedirectOnLoginSuccess: "string",
  },
  providesData: true,
  globalActions: {
    login: {
      parameters: [
        {
          name: "email",
          type: "string",
        },
        {
          name: "password",
          type: "string",
        },
        {
          name:"successRedirect",
          type: "string"
        }
      ],
    },
    signup: {
      parameters: [
        {
          name: "email",
          type: "string",
        },
        {
          name: "password",
          type: "string",
        },
        {
          name:"successRedirect",
          type: "string"
        }
      ],
    },
    logout: {
      parameters: [
        {
          name:"successRedirect",
          type: "string"
        }
      ]
    },
    resetPasswordForEmail: {
      parameters: [
        {
        name: "email",
        type: "string",
        },
      ],
    },
    updateUserPassword: {
      parameters: [
        {
        name: "password",
        type: "string",
        },
      ],
    },
  },
});

PLASMIC.registerComponent(SupabaseAddRowProvider, {
  name: "SupabaseAddRowProvider",
  providesData: true,
  props: {
    children: "slot",
    tableName: "string",
    redirectOnSuccess: "string",
    forceLatestError: "boolean",
    generateRandomErrors: "boolean",
  },
  refActions: {
    addRow: {
      description: "add a row",
      argTypes: [{ name: "row", type: "object" }],
    },
    clearError: {
      description: "clear the latest error message",
      argTypes: [],
    },
  },
});

PLASMIC.registerComponent(SupabaseProvider, {
  name: "SupabaseProvider",
  providesData: true,
  props: {
    queryName: {
      type: "string",
      required: true,
    },
    tableName: {
      type: "string",
      required: true,
    },
    columns: {
      type: "string",
      defaultValue: "*",
    },
    filters: {
      type: "array",
      itemType: {
        type: "object",
        fields: {
          fieldName: "string",
          operator: {
            type: "choice",
            options: [
              {
                value: "eq",
                label: "is equal to (eq)"
              },
              {
                value: "neq",
                label: "not equal to (neq)"
              },
              {
                value: "gt",
                label: "greater than (gt)"
              },
              {
                value: "gte",
                label: "greater than or equal to (gte)"
              },
              {
                value: "lt",
                label: "less than (lt)"
              },
              {
                value: "lte",
                label: "less than or equal to (lte)"
              },
              {
                value: "like",
                label: "matches a case-sensitive pattern (like)"
              },
              {
                value: "ilike",
                label: "matches a case-insensitive pattern (ilike)"
              },
              {
                value: "is",
                label: "is (is)"
              },
              {
                value: "in",
                label: "is in an array (in)"
              },
              {
                value: "contains",
                label: "contains every element in (contains)"
              },
              {
                value: "containedby",
                label: "contained by (containedby)"
              },
              {
                value: "rangeGt",
                label: "greater than range (rangeGt)"
              },
              {
                value: "rangeGte",
                label: "greater than or equal to range (rangeGte)"
              },
              {
                value: "rangeLt",
                label: "less than range (rangeLt)"
              },
              {
                value: "rangeLte",
                label: "less than or equal to range (rangeLte)"
              },
              {
                value: "rangeAdjacent",
                label: "is mutually exclusive to range (rangeAdjacent)"
              },
              {
                value: "overlaps",
                label: "has an element in common with (overlaps)"
              },
              {
                value: "match",
                label: "where each { column:value, ... } matches (match)"
              },
              {
                value: "or",
                label: "that matches at least one PostgREST filter (or)"
              },
              {
                value: "textSearch",
                label: "matches the query string (textSearch)"
              },
              {
                value: "not",
                label: "that doesn't match the PostgREST filter (not)"
              },
            ]
          },
          value: "string",
          value2: "string",
        },
      },
      description:
        "Filters to execute during the query. Acceptable values are eq, neq, gt, lt, gte, lte.",
    },
    initialSortField: "string",
    initialSortDirection: {
      type: "choice",
      options: ["asc", "desc"],
    },
    uniqueIdentifierField: {
      type: "string",
      required: true,
      defaultValue: "id",
    },
    hideDefaultErrors: {
      type: 'boolean',
      advanced: true,
      description: 'Hide default errors so you can use the $ctx values yourself to show custom error messages'
    },
    forceLoading: {
      type: "boolean",
      advanced: true,
    },
    forceValidating: {
      type: "boolean",
      advanced: true,
    },
    forceNoData: {
      type: "boolean",
      advanced: true,
    },
    forceQueryError: {
      type: "boolean",
      advanced: true,
    },
    forceMutationError: {
      type: "boolean",
      advanced: true,
    },
    generateRandomErrors: {
      type: "boolean",
      advanced: true,
    },
    loading: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Loading...",
      },
    },
    validating: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Validating...",
      },
    },
    noData: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "No data",
      },
    },
    children: {
      type: "slot",
      defaultValue: [
        {
          type: "text",
          value:
            `INSTRUCTIONS FOR SUPABASE PROVIDER:
            1. Click the new SupabaseProvider component in the Component tree (LHS of screen) to open it's settings
            2. In settings on RHS of screen, choose a globally unique "Query name" (eg "/pagename/staff")
            3. Enter the correct "table name" from Supabase (eg "staff")
            4. On LHS of screen, change the name of SupabaseProvider to match the query name
            5. Delete this placeholder text (from "children" slot). Then add components to "children" and use the dynamic data as you wish! :)`,
        },
      ],
    },
  },
  refActions: {
    sortRows: {
      description: "sort rows",
      argTypes: [
        { name: "sortField", type: "string" },
        { name: "sortDirection", type: "string" },
      ],
    },
    refetchData: {
      description: "refetch rows from the database",
      argTypes: [],
    },
    deleteRow: {
      description: "delete a row by ID",
      argTypes: [{ name: "ID", type: "string", displayName: "Id / unique identifier of the row to delete" }],
    },
    addRow: {
      description: "add a row",
      argTypes: [
        { name: "rowForSupabase", type: "object", displayName: "Row object to send to Supabase" },
        { name: "optimisticRow", type: "object", displayName: "Optimistic new row object (optional)"},
      ],
    },
    editRow: {
      description: "edit row",
      argTypes: [
        { name: "rowForSupabase", type: "object", displayName: "Row object to send to Supabase"},
        { name: "optimisticRow", type: "object", displayName: "Optimistic edited row object (optional)"},
      ],
    },
    runRpc: {
      description: 'RPC for add row',
      argTypes: [
        { name: "rpcName", displayName: 'Name of the RPC', type: "string" },
        { name: "dataForSupabase", displayName: 'Data for Supabase API call', type: "object"},
        { name: "optimisticData", displayName: 'Data for optimistic operation (optional)', type: 'object'},
        { 
          //Choose the optimistic operation to perform
          //Done in plain text since "choice" type doesn't work in refActions
          name: "optimisticOperation", 
          displayName: 'Optimistic operation (addRow / editRow / deleteRow / replaceData) (optional)', 
          type: "string" 
        },
      ]
    },
    clearError: {
      description: "clear the latest error message",
      argTypes: [],
    },
  },
});

PLASMIC.registerComponent(SupabaseStorageProvider, RegisterSupabaseStorageProvider);

PLASMIC.registerComponent(SupabaseStorageGetSignedUrl, {
  name: "SupabaseStorageGetSignedUrl",
  description: "Get a signed URL for a file in a private bucket. For public buckets, directly construct the public URL instead.",
  providesData: true,
  props: {
    queryName: "string",
    bucketName: "string",
    filePath: "string",
    expiresIn: "number",
    hideDefaultErrors: "boolean",
    children: "slot",
    loading: "slot",
    validating: "slot",
    noData: "slot",
    forceNoData: "boolean",
    forceQueryError: "boolean",
    forceMutationError: "boolean",
    forceLoading: "boolean",
    forceValidating: "boolean",
  },
  refActions: {
    refetchSignedUrl: {
      description: "Refetch the signed URL",
      argTypes: [],
    },
    clearError: {
      description: "Clear the latest error message",
      argTypes: [],
    },
  },
});

PLASMIC.registerComponent(MyInput, MyInputRegistration);
PLASMIC.registerComponent(PromisesPattern, PromisesPatternRegister);
PLASMIC.registerComponent(SupabaseFileUploader, registerSupabaseFileUploader);
PLASMIC.registerComponent(UppyUploader, UppyUploaderRegistration)