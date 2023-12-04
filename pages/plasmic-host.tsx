import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
import { registerComponent } from '@plasmicapp/host';
import { PLASMIC } from '@/plasmic-init';

//Components for use in the Plasmic editor
import { HelloWorld } from '@/components/plasmic/HelloWorld';
import { TweetsProvider } from '@/components/plasmic/TweetsProvider';

registerComponent(HelloWorld, {
  importPath: '@components/plasmic/HelloWorld.tsx', 
  name: 'HelloWorld',
  props: {
    name: {
      type: 'string',
      defaultValue: 'Something',
    }
  }
})

registerComponent(TweetsProvider, {
  importPath: '@components/plasmic/TweetsProvider.tsx', 
  name: 'TweetsProvider',
  providesData: true,
  props: {
    children: {
      type: 'slot',
    }
  }
})

export default function PlasmicHost() {
  return PLASMIC && <PlasmicCanvasHost />;
}
