import * as React from 'react';
import { PlasmicCanvasHost } from '@plasmicapp/loader-nextjs';
import { registerComponent } from '@plasmicapp/host';
import { PLASMIC } from '@/plasmic-init';

//Components for use in the Plasmic editor
import { HelloWorld } from '@/components/plasmic/HelloWorld';

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

export default function PlasmicHost() {
  return PLASMIC && <PlasmicCanvasHost />;
}
