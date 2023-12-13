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
import build from "next/dist/build";
import { get } from "http";

//Declare types
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
type StaffFromAddForm = Pick<StaffRow, "name">;
type StaffRows = Database["public"]["Tables"]["staff"]["Row"][] | null;

interface StaffActions {
  sortData(sortField1: string, sortField1Direction: "asc" | "desc", sortField2: string, sortField2Direction: "asc" | "desc"): Promise<void>;
  refetchData(): Promise<void>;
  deleteStaff(id: StaffRow["id"]): void;
  addStaff(staff: StaffFromAddForm): void;
  editStaff(staff: StaffRow): void;
}

type SortObj = {
  field: string;
  direction: "asc" | "desc";
};

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
  initialSortField: string;
  initialSortDirection: "asc" | "desc";
}

type SortDirection = 'asc' | 'desc';
type SortFuncType = (a: any, b: any) => number;
type GetSortFunc = (fieldName: string, direction: SortDirection) => SortFuncType;

const getSortFunc : GetSortFunc = (fieldName, direction) => {
  console.log(fieldName)
  console.log(direction)
  return function(a, b) {
    if (direction === 'asc') {
      return a[fieldName] > b[fieldName] ? 1 : -1;
    } else {
      return a[fieldName] < b[fieldName] ? 1 : -1;
    }
  }
}


//Define the staff provider component
export const StaffProvider = forwardRef<StaffActions, StaffProviderProps>(
  function StaffProvider(_props, ref) {
    const {
      generateRandomErrors,
      initialSortField: initialSortField,
      initialSortDirection: initialSortDirection,
    } = _props;

    //Get global context value simulateUserSettings from Plasmic Studio (as entered by user)
    //This helps us initialise supabase with a simulated logged in user when viewing pages in the Studio or Preview
    //Because iframe rendered app (in studio) can't access localStorage or Cookies when auth tokens are stored
    const dataEnv = useDataEnv();
    const simulateUserSettings = dataEnv?.SupabaseUser.simulateUserSettings;

    //Setup state
    const [data, setData] = useState<StaffRows>(null);
    const [latestError, setLatestError] = useState<Error | null>(null);
    const [sortField, setSortField] = useState<string>(initialSortField);
    const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

    //Define a getter function for sorting based on the current sort field and direction
    const getSort = useCallback(() => {
      return getSortFunc(sortField, sortDirection);
    }, [sortField, sortDirection])

    //Function that can be called to fetch data
    const fetchData = useCallback(async () => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { data, error } = await supabase.from("staff").select("*");
      if (error) {
        throw error;
      }
      if(data.length) {
        data.sort(getSort());
      }
      return data;
    }, [simulateUserSettings, getSort]);

    //Fetch data using SWR
    const {
      data: fetchedData,
      error,
      mutate,
      isValidating,
    } = useSWR("/staff", fetchData);

    //When data changes, set data
    useEffect(() => {
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    //When error changes, set latest error
    useEffect(() => {
      if (error) {
        setLatestError(error);
      }
    }, [error]);

    //Define functions to add, edit and delete staff
    const addOptimisticRowToDataState = useCallback(
      (data: StaffRows | null, staff: StaffFromAddForm) => {
        const opsimisticRow = {
          id: Math.random(),
          name: staff.name,
          created_at: new Date().toISOString(),
        };
        const newData = [...(data || []), opsimisticRow];
        if(newData.length) newData.sort(getSort());
        return newData;
      },
      [getSort]
    );

    const addStaff = useCallback(
      async (staff: StaffFromAddForm) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on addStaff");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase.from("staff").insert(staff);
        if (error) throw error;
        return addOptimisticRowToDataState(data, staff);
      },
      [
        simulateUserSettings,
        data,
        generateRandomErrors,
        addOptimisticRowToDataState,
      ]
    );

    const editRowInDataState = useCallback(
      (data: StaffRows | null, staff: StaffRow) => {
        const newData =
          data?.map((row) => {
            if (row.id === staff.id) {
              return staff;
            }
            return row;
          }) || [];
        if(newData.length) newData.sort(getSort());
        return newData;
      },
      [getSort]
    );

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
      [simulateUserSettings, data, generateRandomErrors, editRowInDataState]
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
      sortData: async(sortField1, sortField1Direction, sortField2, sortField2Direction) => {
        setSortField(sortField1);
        setSortDirection(sortField1Direction);
        const newData = [...(data || [])];
        newData.sort(getSortFunc(sortField1, sortField1Direction));
        setData(newData);
      },
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
              sort: {
                field: sortField,
                direction: sortDirection,
              }
            }}
          >
            {_props.children}
          </DataProvider>
        )}
      </>
    );
  }
);
