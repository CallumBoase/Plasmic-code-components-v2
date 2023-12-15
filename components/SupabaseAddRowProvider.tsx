import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback
} from "react";
import { DataProvider, useDataEnv } from "@plasmicapp/loader-nextjs";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";
import getErrMsg from "@/utils/getErrMsg";
import { useSafeRouter as useRouter } from "@/utils/useSafeRouter";

//Declare types
type RowFromAddForm = {
  [key: string]: any;
};

interface Actions {
  addRow(rowFromAddForm: any): void;
  clearError(): void;
}

interface SupabaseAddRowProviderProps {
  tableName: string;
  redirectOnSuccess?: string;
  children: React.ReactNode;
  forceLatestError: boolean;
  generateRandomErrors: boolean;
}

//Define the Supabase provider component
export const SupabaseAddRowProvider = forwardRef<
  Actions,
  SupabaseAddRowProviderProps
>(function SupabaseAddRowProvider(props, ref) {
  const {
    tableName,
    redirectOnSuccess,
    generateRandomErrors,
    forceLatestError,
    children,
  } = props;

  const router = useRouter();

  //Get global context value simulateUserSettings from Plasmic Studio (as entered by user)
  //This helps us initialise supabase with a simulated logged in user when viewing pages in the Studio or Preview
  //Because iframe rendered app (in studio) can't access localStorage or Cookies when auth tokens are stored
  const dataEnv = useDataEnv();
  const simulateUserSettings = dataEnv?.SupabaseUser.simulateUserSettings;

  //Setup state
  const [latestError, setLatestError] = useState<string | null>(null);

  //Fetch data using SWR

  const addRow = useCallback(
    async (row: RowFromAddForm) => {
      if (generateRandomErrors && Math.random() > 0.5)
        throw new Error("Randomly generated error on addRow");
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { error } = await supabase.from(tableName).insert(row);
      if (error) throw error;
      return;
    },
    [simulateUserSettings, generateRandomErrors, tableName]
  );

  //Define element actions which can be called outside this component in Plasmic Studio
  //Note the opsimistic updates
  useImperativeHandle(ref, () => ({
    addRow: async (row) => {
      try {
        await addRow(row);
        if(redirectOnSuccess && router) router.push(redirectOnSuccess);
        return;
      } catch (err) {
        setLatestError(getErrMsg(err));
      }
    },
    clearError: () => {
      setLatestError(null);
    },
  }));

  //Render the component
  return (
    <DataProvider
      name="SupabaseAddRowProvider"
      data={{
        latestError: latestError || forceLatestError,
      }}
    >
      {children}
    </DataProvider>
  );
});
