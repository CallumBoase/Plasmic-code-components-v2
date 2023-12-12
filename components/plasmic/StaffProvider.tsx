import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  usePlasmicQueryData,
  DataProvider,
  useDataEnv,
} from "@plasmicapp/loader-nextjs";
import { useMutablePlasmicQueryData } from "@plasmicapp/query";
import { usePlasmicInvalidate } from "@plasmicapp/data-sources";
import { mutate } from "swr";
import type { Database } from "@/types/supabase";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";

interface StaffActions {
  refetchData(): Promise<void>;
  deleteStaff(id: number): void;
  addStaff(staff: { name: string }): void;
  editStaff(staff: { id: number; name: string }): void;
}

interface StaffProviderProps {
  children: React.ReactNode;
}

export const StaffProvider = forwardRef<StaffActions, StaffProviderProps>(
  function StaffProvider(_props, ref) {
    
    //Get global context value simulateUserSettings from Plasmic Studio (as entered by user)
    //This helps us initialise supabase with a simulated logged in user when viewing pages in the Studio or Preview
    //Because iframe rendered app (in studio) can't access localStorage or Cookies when auth tokens are stored
    const dataEnv = useDataEnv();
    const simulateUserSettings = dataEnv?.SupabaseUser.simulateUserSettings;


    //Function that can be called to fetch data
    const fetchData = useCallback(async () => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { data, error } = await supabase
        .from("staff")
        .select("*")
        .order("name", { ascending: true });
      if (error) {
        throw error;
      }
      return data;
    }, [simulateUserSettings]);

    //Doesn't seem to work at all!
    //const refresh = usePlasmicInvalidate();

    //Fetch the data using plasmic studio methods
    //This is OFF in order to fix the strange caching / revalidation isues
    //*****IDEA: we could use native swr or some other caching method to help here******
    //This seems to work but only if revalidateIfStale is set to true??
    // const {
    //   data: fetchedData,
    //   error,
    //   isLoading
    // } = useMutablePlasmicQueryData("/staff", fetchData, {
    //   revalidateOnFocus: false,
    //   revalidateOnReconnect: false,
    //   //See https://github.com/plasmicapp/plasmic/blob/master/packages/data-sources/src/hooks/usePlasmicDataOp.tsx#L379
    //   revalidateIfStale: false,
    // });

    const {
      data: fetchedData,
      error,
      isLoading
    } = usePlasmicQueryData("/staff", fetchData);
    
    //Store the fetched data in state
    const [data, setData] = useState<Database["public"]["Tables"]["staff"]["Row"][] | null>(null);

    //Was needed when fetching data using plasmic studio methods
    useEffect(() => {
      console.log('useEffect')
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    //Define element actions which can be called outside this component
    useImperativeHandle(
      ref,
      () => ({
        refetchData: async () => {
          mutate('/staff')
        },
        deleteStaff: async (id) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.from("staff").delete().eq("id", id);
          if (error) throw error;
          mutate('/staff')
        },
        addStaff: async (staff) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.from("staff").insert(staff);
          if (error) throw error;
          mutate('/staff')
        },
        editStaff: async (staff) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase
            .from("staff")
            .update(staff)
            .eq("id", staff.id);
          if (error) throw error;
          mutate('/staff')
        },
      }),
    );
    
    //Render elements on the page
    return (
      <>
        {/* {isLoading && <div>Loading...</div>} */}
        {error && <div>Error: {error.message}</div>}
        {!data || (data.length === 0 && <div>No data</div>)}
        {data && (
          <DataProvider name="staff" data={data}>
            {_props.children}
          </DataProvider>
        )}
      </>
    );
  }
);
