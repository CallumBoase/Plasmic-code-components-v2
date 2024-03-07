import {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback
} from "react";
import { DataProvider } from "@plasmicapp/loader-nextjs";
import supabaseBrowserClient from "@/utils/supabase/component";
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
  className?: string;
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
    className,
    tableName,
    redirectOnSuccess,
    generateRandomErrors,
    forceLatestError,
    children,
  } = props;

  const router = useRouter();

  //Setup state
  const [latestError, setLatestError] = useState<string | null>(null);

  //Fetch data using SWR

  const addRow = useCallback(
    async (row: RowFromAddForm) => {
      if (generateRandomErrors && Math.random() > 0.5)
        throw new Error("Randomly generated error on addRow");
      const supabase = supabaseBrowserClient();
      const { error } = await supabase.from(tableName).insert(row);
      if (error) throw error;
      return;
    },
    [ generateRandomErrors, tableName]
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
    <div className={className}>
      <DataProvider
        name="SupabaseAddRowProvider"
        data={{
          latestError: latestError || forceLatestError,
        }}
      >
        {children}
      </DataProvider>
    </div>
  );
});
