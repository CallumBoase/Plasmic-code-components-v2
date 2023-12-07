import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

//Custom components
import { AuthProvider } from "./components/plasmic/AuthProvider";
import { UserProvider } from "./components/plasmic/UserProvider";
import { HelloWorld } from './components/plasmic/HelloWorld'
import { TweetsProvider } from './components/plasmic/TweetsProvider'
import { Counter } from "./components/plasmic/Counter";
import { StaffProvider } from "./components/plasmic/StaffProvider";

export const PLASMIC = initPlasmicLoader({
  projects: [
    {
      id: "j5kwR4gbf2MEZDV6eJXqij",
      token: "Pl18l30xNglhCwI6AasBpyByr1md0I50BDEAeCA17435huuiOp5MIXP7aMPzKuQALoImfqDgfsjnypoUI1w",
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

PLASMIC.registerGlobalContext(UserProvider, {
  name: 'UserProvider',
  props: {},
  providesData: true
});

PLASMIC.registerGlobalContext(AuthProvider, {
  name: 'AuthProvider',
  props: {},
  providesData: true
})

// PLASMIC.registerComponent(AuthProvider, {
//   name: 'AuthProvider',
//   props: {
//     children: 'slot'
//   },
//   providesData: true,
//   refActions: {
//     login: {
//       description: 'Login a user',
//       argTypes: [
//         {name: 'username', type: 'string'},
//         {name: 'password', type: 'string'}
//       ]
//     },
//     logout: {
//       description: 'Logout a user',
//       argTypes: []
//     },
//     refetchSession: {
//       description: 'Refetch the session',
//       argTypes: []
//     }
//   }
// });

PLASMIC.registerComponent(HelloWorld, {
  name: 'HelloWorld',
  props: {
    name: {
      type: 'string',
      defaultValue: 'Something',
    }
  }
})

PLASMIC.registerComponent(TweetsProvider, {
  name: 'TweetsProvider',
  providesData: true,
  props: {
    children: 'slot'
  }
})

PLASMIC.registerComponent(StaffProvider, {
  name: 'StaffProvider',
  providesData: true,
  props: {
    children: 'slot'
  },
  refActions: {
    deleteStaff: {
      description: 'delete a staff member',
      argTypes: [
        {name: 'Staff ID', type: 'number'}
      ]
    },
    addStaff: {
      description: 'add a staff member',
      argTypes: [
        {name: 'staff', type: 'object'}
      ]
    },
    editStaff: {
      description: 'edit a staff member',
      argTypes: [
        {name: 'staff', type: 'object'}
      ]
    }
  }
})

PLASMIC.registerComponent(Counter, {
  name: 'Counter',
  props: {},
  refActions: {
    increment: {
      description: 'Add one to the counter',
      argTypes: []
    },
    decrement: {
      description: 'Subtract one from the counter',
      argTypes: []
    },
    set: {
      description: 'Set the counter to any number',
      argTypes: [
        {
          name: 'count',
          type: 'number'
        }
      ]
    }
  }
});
