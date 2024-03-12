import { useState } from "react";
import { forwardRef, useImperativeHandle } from "react";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import getErrMsg from "@/utils/getErrMsg";

interface PromisesPatternActions {
  simulateApiCall(): Promise<{ apiCallResult: any; error: string | null }>;
  simulateApiCallWithOptions(
    runNextActionImmediately: boolean
  ): Promise<{ apiCallResult: any; error: string | null }>;
}

interface Props {
  children: React.ReactNode;
}

type SimulatedApiCall = {
  data: string;
  error: string | null;
};

type SomeApiCall = () => Promise<string>;

//Helper function to run a promise, returning null immediately, or returning with data after promise resolves
async function runPromiseWithImmediateOrAwaitedReturn(
  promiseFunc: () => Promise<any>,
  onSuccess: (successData: any) => any,
  onError: (error: any) => any,
  returnImmediately: boolean = false
) {
  //if runNextActionImmediately is true
  if (returnImmediately) {
    //Initiate promise but odn't wait for it to resolve
    promiseFunc().then(onSuccess).catch(onError);
    //Return immediately
    return null;
  } else {
    try {
      //Wait for the promise to resolve
      const data = await promiseFunc();
      return onSuccess(data);
      //Then return
      // return { error: null, data };
    } catch (error) {
      return onError(error);
      // return { error: getErrMsg(error), data: null };
    }
  }
}

//The component
export const PromisesPattern = forwardRef<PromisesPatternActions, Props>(
  function Counter(props, ref) {
    const { children } = props;

    const [value, setValue] = useState<null | string>("initial");
    const [error, setError] = useState<null | string>(null);

    console.log("component render, value is:", value);

    //Helper function to run an API call and return value
    //Does NOT set state
    const someApiCall: SomeApiCall = async () => {
      const dateReturnVal = new Date().toISOString();

      //Simulate an API call to Supabase
      //The below is instead of const { data, error } = await supabase....
      const { data, error } = await new Promise<SimulatedApiCall>((resolve) =>
        setTimeout(() => resolve({ data: dateReturnVal, error: null }), 3000)
      );

      //Instead of if (error) throw error;
      if (Math.random() > 0.5) throw Error("random error");

      //Return the data back to the caller
      return data;
    };

    useImperativeHandle(ref, () => {
      return {
        //Element action to run in plasmic studio
        //Simple version that always waits for the promise to resolve before returning
        //Therefore next Interaction action will not run until this one has finished
        //And next Interaction action will have access to the value from the api call via $steps (but NOT $ctx or $state)
        async simulateApiCall() {
          try {
            console.log("simulateApiCall run start");
            const apiCallResult = await someApiCall();
            console.log("setting value to:", apiCallResult);
            setError(null);
            setValue(apiCallResult);
            console.log("value has been set to:", apiCallResult);
            return { apiCallResult, error: null };
          } catch (error) {
            console.log("error from api call:", error);
            setError(getErrMsg(error));
            setValue(null);
            return { apiCallResult: null, error: getErrMsg(error) };
          }
        },

        //Element action to run in plasmic studio
        //Version that can run the next action immediately or wait for the promise to resolve
        //If runNextActionImmediately is true, the promise will be initiated but not waited for, and we return null
        //This allows the next action to run immediately but without access to the value from the api call in any form
        //If runNextActionImmediately is false, the promise will be awaited and the value of the api call returned
        //This allows the next action to run only after the promise has resolved, and with access to the value from the api call via $steps (but NOT $ctx or $state)
        async simulateApiCallWithOptions(
          runNextActionImmediately: boolean = false
        ) {
          console.log("simulateApiCallWithOptions run start")

          //Run the promise with immediate return or return that waits for the promise to resolve
          return runPromiseWithImmediateOrAwaitedReturn(
            //The promise to run ie the api call
            someApiCall,
            //What to do if the promise resolves successfully
            //Note: you can call the success data (apiCallResult) anything you want
            (apiCallResult) => {
              console.log("setting value to:", apiCallResult);
              setError(null);
              setValue(apiCallResult);
              console.log("value has been set to:", apiCallResult);
              return { apiCallResult, error: null };
            },
            //What to do if the promise rejects
            //Note: you can call the error data anything you want
            (error) => {
              console.log("error from api call:", error);
              setError(getErrMsg(error));
              setValue(null);
              return { apiCallResult: null, error: getErrMsg(error) };
            },
            //Whether to return immediately or wait for the promise to resolve before returning
            runNextActionImmediately
          );
        },
      };
    });
    return (
      <DataProvider
        name="PromisesPattern"
        data={{
          value,
          error,
        }}
      >
        {children}
      </DataProvider>
    );
  }
);

export const PromisesPatternRegister = {
  name: "PromisesPattern",
  providesData: true,
  props: {
    children: "slot",
  },
  refActions: {
    simulateApiCall: {
      description: "simulateApiCall",
      argTypes: [],
    },
    simulateApiCallWithOptions: {
      description: "simulateApiCallWithOptions",
      argTypes: [
        {
          name: "runNextActionImmediately",
          description: "runNextActionImmediately",
          type: "boolean",
          defaultValue: "false",
        },
      ],
    },
  },
};
