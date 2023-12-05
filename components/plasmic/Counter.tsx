import { forwardRef, useImperativeHandle, useState } from 'react';

interface CounterActions {
  increment(): void;
  decrement(): void;
  set(count: number): void;
}

export const Counter = forwardRef<CounterActions>(function Counter(_props, ref) {
  const [count, setCount] = useState<number>(0);
  useImperativeHandle(
    ref,
    () => {
      return {
        increment() {
          setCount((count) => count + 1);
        },
        decrement() {
          setCount((count) => count - 1);
        },
        set(count: number) {
          setCount(count);
        }
      };
    },
    [setCount]
  );
  return <span>{count}</span>;
});