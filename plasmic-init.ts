import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

//Custom components
import { SupabaseUser } from "./components/SupabaseUserProvider";
import { SupabaseProvider } from "./components/SupabaseProvider";
import { SupabaseAddRowProvider } from "./components/SupabaseAddRowProvider";

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

//Works but makes building hard - only populated after login in PREVIEW or localhost not in builder
PLASMIC.registerGlobalContext(SupabaseUser, {
  name: "SupabaseUserGlobalContext",
  props: {
    redirectOnLoginSuccess: "string",
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
      ],
    },
    logout: {
      parameters: [],
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
          operator: "string",
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
      argTypes: [{ name: "ID", type: "string" }],
    },
    addRow: {
      description: "add a row",
      argTypes: [
        { name: "fullRow", type: "object" },
        { name: "rowForSupabase", type: "object" }
      ],
    },
    editRow: {
      description: "edit row",
      argTypes: [
        { name: "fullRow", type: "object" },
        { name: "rowForSupabase", type: "object"}
      ],
    },
    rpcForAddRow: {
      description: 'RPC for add row',
      argTypes: [
        { name: "rpcName", type: "string" },
        { name: "fullRow", type: "object" },
        { name: "rowForSupabase", type: "object"}
      ]
    },
    clearError: {
      description: "clear the latest error message",
      argTypes: [],
    },
  },
});
