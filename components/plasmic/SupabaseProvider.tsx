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
import getSortFunc, { type SortDirection } from "@/utils/getSortFunc";

//Declare types
type Row = {
  [key: string]: any;
};
type RowFromAddForm = {
  [key: string]: any;
};
type Rows = Row[] | null;

type FetchData = () => Promise<Rows>;

interface Actions {
  sortRows(sortField: string, sortDirection: "asc" | "desc"): Promise<void>;
  refetchRows(): Promise<void>;
  deleteRow(id: any): void;
  addRow(rowFromAddForm: any): void;
  editRow(row: any): void;
}

type PlaceholderForOptimisticAdd = {
  fieldName: string;
  value: any;
};

interface SupabaseProviderProps {
  queryName: string;
  tableName: string;
  columns: "string";
  uniqueIdentifierField: string;
  placeholdersForOptimisticAdd: PlaceholderForOptimisticAdd[] | null;
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



//Define the Supabase provider component
export const SupabaseProvider = forwardRef<Actions, SupabaseProviderProps>(
  function SupabaseProvider(props, ref) {
    const {
      queryName,
      tableName,
      columns,
      uniqueIdentifierField,
      placeholdersForOptimisticAdd,
      generateRandomErrors,
      initialSortField: initialSortField,
      initialSortDirection: initialSortDirection,
    } = props;

    //Get global context value simulateUserSettings from Plasmic Studio (as entered by user)
    //This helps us initialise supabase with a simulated logged in user when viewing pages in the Studio or Preview
    //Because iframe rendered app (in studio) can't access localStorage or Cookies when auth tokens are stored
    const dataEnv = useDataEnv();
    const simulateUserSettings = dataEnv?.SupabaseUser.simulateUserSettings;

    //Setup state
    const [data, setData] = useState<Rows>(null);
    const [sortedData, setSortedData] = useState<Rows>(null);
    const [latestError, setLatestError] = useState<Error | null>(null);
    const [sortField, setSortField] = useState<string>(initialSortField);
    const [sortDirection, setSortDirection] =
      useState<SortDirection>(initialSortDirection);

    //When data or sorting changes, set sortedData
    //This works better with opsimistic updates than directly sorting data in query / mutation functions
    //Because the user may change sort order partway through async query/mutation causes glitches
    //This takes care of sort automatically whenever data or sort changes, making it smooth & easy
    useEffect(() => {
      console.log("data or sort changed");
      console.log(data);
      if (data) {
        const newData = [...data];
        newData.sort(getSortFunc(sortField, sortDirection));
        setSortedData(newData);
      }
    }, [data, sortField, sortDirection]);

    //Function that can be called to fetch data
    const fetchData : FetchData = useCallback(async () => {
      const supabase = await supabaseBrowserClient(simulateUserSettings);
      const { data, error } = await supabase.from(tableName).select(columns);
      if (error) {
        throw error;
      }
      return data;
    }, [simulateUserSettings, tableName, columns]);

    //Fetch data using SWR
    const {
      data: fetchedData,
      error,
      mutate,
      isValidating,
    } = useSWR(`/${queryName}`, fetchData);

    //When data changes, set data
    //In turn this will cause change to sortedData
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

    //Define functions to add, edit and delete row
    const addRowOptimistically = useCallback(
      (data: Rows | null, row: RowFromAddForm) => {
        //Convert array of placeholders in format of {fieldName, value} to object {fieldName: value}
        const extraData = placeholdersForOptimisticAdd?.reduce((acc, curr) => {
          return { ...acc, [curr.fieldName]: curr.value };
        }, {});
        const opsimisticRow = { ...row, ...extraData };
        const newData = [...(data || []), opsimisticRow];
        return newData;
      },
      [placeholdersForOptimisticAdd]
    );

    const addRow = useCallback(
      async (row: RowFromAddForm) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on addRow");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase.from(tableName).insert(row);
        if (error) throw error;
        return addRowOptimistically(data, row);
      },
      [
        simulateUserSettings,
        data,
        generateRandomErrors,
        addRowOptimistically,
        tableName,
      ]
    );

    const editRowOptimistically = useCallback(
      (data: Rows, row: Row) => {
        const newData =
          data?.map((existingRow) => {
            if (
              row[uniqueIdentifierField] === existingRow[uniqueIdentifierField]
            ) {
              return row;
            }
            return existingRow;
          }) || [];
        return newData;
      },
      [uniqueIdentifierField]
    );

    const editRow = useCallback(
      async (row: Row) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on editRow");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase
          .from(tableName)
          .update(row)
          .eq(uniqueIdentifierField, row[uniqueIdentifierField]);
        if (error) throw error;
        return editRowOptimistically(data, row);
      },
      [
        simulateUserSettings,
        data,
        generateRandomErrors,
        editRowOptimistically,
        tableName,
        uniqueIdentifierField,
      ]
    );

    const deleteRowOptimistically = useCallback(
      (data: Rows, uniqueIdentifierVal: number | string) => {
        const newData = data?.filter(
          (row) => row[uniqueIdentifierField] !== uniqueIdentifierVal
        );
        if(!newData) return null;
        return newData;
      },
      [uniqueIdentifierField]
    );

    const deleteRow = useCallback(
      async (uniqueIdentifierVal: number | string) => {
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on deleteRow");
        const supabase = await supabaseBrowserClient(simulateUserSettings);
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(uniqueIdentifierField, uniqueIdentifierVal);
        if (error) throw error;
        return deleteRowOptimistically(data, uniqueIdentifierVal);
        //use-swr will now revalidate data so no need to refetch single one here
      },
      [
        simulateUserSettings,
        data,
        generateRandomErrors,
        tableName,
        uniqueIdentifierField,
        deleteRowOptimistically,
      ]
    );

    //Define element actions which can be called outside this component in Plasmic Studio
    //Note the opsimistic updates
    useImperativeHandle(ref, () => ({
      sortRows: async (sortField, sortDirection) => {
        setSortField(sortField);
        setSortDirection(sortDirection);
      },
      refetchRows: async () => {
        mutate().catch((err) => console.error(err));
      },
      deleteRow: async (uniqueIdentifierVal) => {
        mutate(deleteRow(uniqueIdentifierVal), {
          populateCache: true,
          optimisticData: deleteRowOptimistically(data, uniqueIdentifierVal),
        }).catch((err) => console.error(err));
      },
      addRow: async (row) => {
        mutate(addRow(row), {
          populateCache: true,
          optimisticData: addRowOptimistically(data, row),
        }).catch((err) => console.error(err));
      },
      editRow: async (row) => {
        mutate(editRow(row), {
          populateCache: true,
          optimisticData: editRowOptimistically(data, row),
        }).catch((err) => console.error(err));
      },
      clearError: () => {
        setLatestError(null);
      },
    }));

    //Render the component
    return (
      <>
        {/*Loading state - validating before we initially have data*/}
        {((isValidating && !fetchedData) || props.forceLoading) &&
          props.loading}

        {/*Validating state - any time we are running mutate() to revalidate cache*/}
        {(isValidating || props.forceValidating) && props.validating}

        {/*No data state*/}
        {(!data || data.length === 0 || props.forceNoData) && props.noData}

        {/*Error state - error is currently there according to SWR*/}
        {(error || props.forceCurrentlyActiveError) &&
          props.currentlyActiveError}

        {/*Error state - error that we persist until user cancels it with element actions*/}
        {(latestError || props.forceLatestError) && props.latestError}

        {/*Render the data provider always*/}
        <DataProvider
          name={queryName || "SupabaseProvider"}
          data={{
            isLoading: (isValidating && !fetchedData) || props.forceLoading,
            isValidating: isValidating || props.forceValidating,
            currentlyActiveError: error || props.forceCurrentlyActiveError,
            latestError: latestError || props.forceLatestError,
            data: props.forceNoData ? null : sortedData,
            sort: {
              field: sortField,
              direction: sortDirection,
            },
          }}
        >
          {/*Render children with data provider - when we have data*/}
          {data && props.children}
        </DataProvider>
      </>
    );
  }
);
