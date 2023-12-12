import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  DataProvider,
  useDataEnv,
} from "@plasmicapp/loader-nextjs";
import useSWR from "swr";
import type { Database } from "@/types/supabase";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";

//Declare types

type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
type StaffFromAddForm = Pick<StaffRow, "name">
type StaffRows = Database["public"]["Tables"]["staff"]["Row"][] | null;

interface StaffActions {
  refetchData(): Promise<void>;
  deleteStaff(id: StaffRow["id"]): void;
  addStaff(staff: StaffFromAddForm): void;
  editStaff(staff: StaffRow): void;
}

interface StaffProviderProps {
  children: React.ReactNode;
}

//Define the staff provider component
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

    //Fetch data using SWR
    const {
      data: fetchedData,
      error,
      mutate,
    } = useSWR("/staff", fetchData);
    
    //Store the fetched data in state
    const [data, setData] = useState<StaffRows>(null);

    useEffect(() => {
      console.log('useEffect')
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    //Add an optimistic row to the data
    //Necessary since we are missing id and created_at fields when adding a new row
    //Until we get the response from the server
    const dataWithOptimisticRow = (data : StaffRows | null, staff : StaffFromAddForm) => {
      const opsimisticRow = {
        id: Math.random(),
        name: staff.name,
        created_at: new Date().toISOString(),
      }
      return [...(data || []), opsimisticRow].sort((a, b) => a.name > b.name ? 1 : -1);
    }

    //Define functions to add, edit and delete staff
    const addStaff = useCallback(async (staff : StaffFromAddForm) => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { error } = await supabase.from("staff").insert(staff);
      if (error) throw error;
      return dataWithOptimisticRow(data, staff);
    }, [simulateUserSettings, data]);

    const editStaff = useCallback(async (staff : StaffRow) => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { error } = await supabase
        .from("staff")
        .update(staff)
        .eq("id", staff.id);
      if (error) throw error;
      return [...(data || []), staff];
    }, [simulateUserSettings, data]);

    const deleteStaff = useCallback(async (id : StaffRow["id"]) => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { error } = await supabase.from("staff").delete().eq("id", id);
      if (error) throw error;
      return data?.filter((staff) => staff.id !== id) || [];
    }, [simulateUserSettings, data]);

    //Define element actions which can be called outside this component in Plasmic Studio
    //Note the opsimistic updates
    useImperativeHandle(
      ref,
      () => ({
        refetchData: async () => {
          mutate()
        },
        deleteStaff: async (id) => {
          await mutate(deleteStaff(id), {
            populateCache: true,
            optimisticData: data?.filter((staff) => staff.id !== id),
          })
        },
        addStaff: async (staff) => {
          mutate(addStaff(staff), {
            populateCache: true,
            optimisticData: dataWithOptimisticRow(data, staff),
          })
        },
        editStaff: async (staff) => {
          mutate(editStaff(staff), {
            populateCache: true,
            optimisticData: [...(data || []), staff],
          })
        }
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
