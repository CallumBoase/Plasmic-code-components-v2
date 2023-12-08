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
    
    //Get a value from the Studio Data Environment
    const dataEnv = useDataEnv();
    const simulateUserSettings = dataEnv?.SupabaseUser.simulateUserSettings;

    //Function we can call to fetch data
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

    //Actually fetching the data
    const {
      data: fetchedData,
      error,
      isLoading,
    } = usePlasmicQueryData("/staff", fetchData);
    
    //Store the fetched data in state
    const [data, setData] = useState<Database["public"]["Tables"]["staff"]["Row"][] | null>(null);

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
          const newData = await fetchData();
          setData(newData);
        },
        deleteStaff: async (id) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.from("staff").delete().eq("id", id);
          if (error) throw error;
          const newData = await fetchData();
          setData(newData);
        },
        addStaff: async (staff) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase.from("staff").insert(staff);
          if (error) throw error;
          const newData = await fetchData();
          setData(newData);
        },
        editStaff: async (staff) => {
          const supabase = await supabaseBrowserClient(simulateUserSettings);
          const { error } = await supabase
            .from("staff")
            .update(staff)
            .eq("id", staff.id);
          if (error) throw error;
          const newData = await fetchData();
          setData(newData);
        },
      }),
    );

    return (
      <>
        {isLoading && <div>Loading...</div>}
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
