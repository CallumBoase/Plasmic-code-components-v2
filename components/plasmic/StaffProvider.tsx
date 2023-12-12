import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { DataProvider, useDataEnv } from "@plasmicapp/loader-nextjs";
import useSWR from "swr";
import type { Database } from "@/types/supabase";
import supabaseBrowserClient from "@/utils/supabaseBrowserClient";

//Declare types
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
type StaffFromAddForm = Pick<StaffRow, "name">;
type StaffRows = Database["public"]["Tables"]["staff"]["Row"][] | null;

interface StaffActions {
  refetchData(): Promise<void>;
  deleteStaff(id: StaffRow["id"]): void;
  addStaff(staff: StaffFromAddForm): void;
  editStaff(staff: StaffRow): void;
}

interface StaffProviderProps {
  children: React.ReactNode;
  loading: React.ReactNode;
  validating: React.ReactNode;
  noData: React.ReactNode;
  currentlyActiveError: React.ReactNode;
  latestError: React.ReactNode;
  forceNoData: boolean;
  forceCurrentlyActiveError: boolean;
  forceLatestError: boolean;
  forceLoading: boolean;
  forceValidating: boolean;
  generateRandomErrors: boolean;
}

//Define the staff provider component
export const StaffProvider = forwardRef<StaffActions, StaffProviderProps>(
  function StaffProvider(_props, ref) {
    const { generateRandomErrors } = _props;

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
      isValidating,
    } = useSWR("/staff", fetchData);

    //Store the fetched data in state
    const [data, setData] = useState<StaffRows>(null);
    const [latestError, setLatestError] = useState<Error | null>(null);

    useEffect(() => {
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    useEffect(() => {
      if (error) {
        setLatestError(error);
      }
    }, [error]);

    //Define functions to add, edit and delete staff
    const addOptimisticRowToDataState = (
      data: StaffRows | null,
      staff: StaffFromAddForm
    ) => {
      const opsimisticRow = {
        id: Math.random(),
        name: staff.name,
        created_at: new Date().toISOString(),
      };
      return [...(data || []), opsimisticRow].sort((a, b) =>
        a.name > b.name ? 1 : -1
      );
    };

    const addStaff = useCallback(
      async (staff: StaffFromAddForm) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on addStaff");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase.from("staff").insert(staff);
        if (error) throw error;
        return addOptimisticRowToDataState(data, staff);
      },
      [simulateUserSettings, data, generateRandomErrors]
    );

    const editRowInDataState = (data: StaffRows | null, staff: StaffRow) => {
      const newData =
        data?.map((row) => {
          if (row.id === staff.id) {
            return staff;
          }
          return row;
        }) || [];
      return newData.sort((a, b) => (a.name > b.name ? 1 : -1));
    };

    const editStaff = useCallback(
      async (staff: StaffRow) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on editStaff");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase
          .from("staff")
          .update(staff)
          .eq("id", staff.id);
        if (error) throw error;
        return editRowInDataState(data, staff);
      },
      [simulateUserSettings, data, generateRandomErrors]
    );

    const deleteRowFromDataState = (
      data: StaffRows | null,
      id: StaffRow["id"]
    ) => {
      return data?.filter((staff) => staff.id !== id) || [];
    };

    const deleteStaff = useCallback(
      async (id: StaffRow["id"]) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on deleteStaff");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase.from("staff").delete().eq("id", id);
        if (error) throw error;
        return deleteRowFromDataState(data, id);
      },
      [simulateUserSettings, data, generateRandomErrors]
    );

    //Define element actions which can be called outside this component in Plasmic Studio
    //Note the opsimistic updates
    useImperativeHandle(ref, () => ({
      refetchData: async () => {
        mutate().catch((err) => console.error(err));
      },
      deleteStaff: async (id) => {
        mutate(deleteStaff(id), {
          populateCache: true,
          optimisticData: deleteRowFromDataState(data, id),
        }).catch((err) => console.error(err));
      },
      addStaff: async (staff) => {
        mutate(addStaff(staff), {
          populateCache: true,
          optimisticData: addOptimisticRowToDataState(data, staff),
        }).catch((err) => console.error(err));
      },
      editStaff: async (staff) => {
        mutate(editStaff(staff), {
          populateCache: true,
          optimisticData: editRowInDataState(data, staff),
        }).catch((err) => console.error(err));
      },
      clearError: () => {
        setLatestError(null);
      },
    }));

    //Render elements on the page
    return (
      <>
        {((isValidating && !fetchedData) || _props.forceLoading) &&
          _props.loading}
        {(isValidating || _props.forceValidating) && _props.validating}
        {(!data || data.length === 0 || _props.forceNoData) && _props.noData}
        {(error || _props.forceCurrentlyActiveError) &&
          _props.currentlyActiveError}
        {(latestError || _props.forceLatestError) && _props.latestError}
        {data && (
          <DataProvider
            name="staff"
            data={{
              isLoading: (isValidating && !fetchedData) || _props.forceLoading,
              isValidating: isValidating || _props.forceValidating,
              currentlyActiveError: error || _props.forceCurrentlyActiveError,
              latestError: latestError || _props.forceLatestError,
              data: _props.forceNoData ? null : data,
            }}
          >
            {_props.children}
          </DataProvider>
        )}
      </>
    );
  }
);
