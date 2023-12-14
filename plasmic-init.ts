import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

//Custom components
import { SupabaseUser } from "./components/plasmic/SupabaseUserProvider";
import { HelloWorld } from "./components/plasmic/HelloWorld";
import { TweetsProvider } from "./components/plasmic/TweetsProvider";
import { Counter } from "./components/plasmic/Counter";
import { SupabaseProvider } from "./components/plasmic/SupabaseProvider";

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
  name: "SupabaseUser",
  props: {
    simulateLoggedInUser: "boolean",
    email: "string",
    password: "string",
  },
  providesData: true,
});

// PLASMIC.registerComponent(SupabaseUser, {
//   name: 'SupabaseUser',
//   props: {
//     children: 'slot'
//   },
//   providesData: true
// });

PLASMIC.registerComponent(HelloWorld, {
  name: "HelloWorld",
  props: {
    name: {
      type: "string",
      defaultValue: "Something",
    },
  },
});

PLASMIC.registerComponent(TweetsProvider, {
  name: "TweetsProvider",
  providesData: true,
  props: {
    children: "slot",
  },
});

PLASMIC.registerComponent(SupabaseProvider, {
  name: "SupabaseProvider",
  providesData: true,
  props: {
    queryName: {
      type: 'string',
      defaultValue: 'SupabaseProvider',
    },
    tableName: 'string',
    columns: {
      type: 'string',
      defaultValue: '*'
    },
    filters: {
      type: 'array',
      itemType: {
        type: 'object',
        fields: {
          fieldName: 'string',
          operator: 'string',
          value: 'string',
          value2: 'string',
        },
      },
      description: 'Filters to execute during the query. Acceptable values are eq, neq, gt, lt, gte, lte.'
    },
    initialSortField: "string",
    initialSortDirection: {
      type: "choice",
      options: ["asc", "desc"],
    },
    uniqueIdentifierField: 'string',
    placeholdersForOptimisticAdd: {
      type: 'array',
      itemType: {
        type: 'object',
        fields: {
          fieldName: 'string',
          value: 'string',
        },
      },
      description: 'Extra values to create your optimistic row, that are not in the add row form'
    },
    // placeholdersForOptimisticAdd: {
    //   type: 'object',
    //   fields: {
    //     fieldName: 'string',
    //     value: 'string',
    //   },
    //   description: 'Extra values to create your optimistic row, that are not in the add row form. Acceptable values for "value" are "random" or "timestamp".'
    // },
    children: "slot",
    loading: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Loading...",
      },
    },
    forceLoading: "boolean",
    validating: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Validating...",
      },
    },
    forceValidating: "boolean",
    currentlyActiveError: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "Error not yet resolved",
      },
    },
    forceCurrentlyActiveError: "boolean",
    latestError: {
      type: "slot",
      defaultValue: [
        { type: "text", value: "Error click to clear" },
        { type: "button", value: "Clear error" },
      ],
    },
    forceLatestError: "boolean",
    noData: {
      type: "slot",
      defaultValue: {
        type: "text",
        value: "No data",
      },
    },
    forceNoData: "boolean",
    generateRandomErrors: "boolean",
  },
  refActions: {
    sortRows: {
      description: "sort rows",
      argTypes: [
        {name: 'sortField', type: 'string'},
        {name: 'sortDirection', type: 'string'},
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
      argTypes: [{ name: "row", type: "object" }],
    },
    editRow: {
      description: "edit row",
      argTypes: [{ name: "row", type: "object" }],
    },
    clearError: {
      description: "clear the latest error message",
      argTypes: [],
    },
  },
});

PLASMIC.registerComponent(Counter, {
  name: "Counter",
  props: {},
  refActions: {
    increment: {
      description: "Add one to the counter",
      argTypes: [],
    },
    decrement: {
      description: "Subtract one from the counter",
      argTypes: [],
    },
    set: {
      description: "Set the counter to any number",
      argTypes: [
        {
          name: "count",
          type: "number",
        },
      ],
    },
  },
});
