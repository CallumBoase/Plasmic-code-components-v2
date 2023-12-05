import { initPlasmicLoader } from "@plasmicapp/loader-nextjs";

//Custom components
import { HelloWorld } from './components/plasmic/HelloWorld'
import { TweetsProvider } from './components/plasmic/TweetsProvider'

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

PLASMIC.registerComponent(HelloWorld, {
  importPath: './components/plasmic/HelloWorld.tsx', 
  name: 'HelloWorld',
  props: {
    name: {
      type: 'string',
      defaultValue: 'Something',
    }
  }
})

PLASMIC.registerComponent(TweetsProvider, {
  importPath: './components/plasmic/TweetsProvider.tsx', 
  name: 'TweetsProvider',
  providesData: true,
  props: {
    children: 'slot'
  }
})
