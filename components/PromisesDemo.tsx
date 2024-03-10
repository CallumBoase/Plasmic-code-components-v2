import { forwardRef, useImperativeHandle } from 'react';

interface PromiseDemoActions {
  nonPromise(): void;
  promise(): Promise<void>;
}

export const PromiseDemo = forwardRef<PromiseDemoActions>(function Counter(_props, ref) {

  const somePromise = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('resolved');
      }, 3000);
    });
  }

  useImperativeHandle(
    ref,
    () => {
      return {
        nonPromise() {
          console.log('nonPromise');
          return
        },
        async promise() {
          //Simulate delay of 3 seconds
          console.log('promise before delay');	
          await new Promise((resolve) => setTimeout(resolve, 3000));
          console.log('promise after delay');
          return;
        },
        async whatWeADo() {
          console.log('WhatWeDo');
          somePromise().catch((err) => console.log(err)).finally(() => console.log('promise finally'));
          console.log('Code below promise');
          return;
        }
      };
    },
    []
  );
  return <span>Promise demo</span>;
});