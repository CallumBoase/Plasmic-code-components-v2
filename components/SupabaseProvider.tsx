import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { DataProvider } from "@plasmicapp/react-web/lib/host";
import useSWR from "swr";
import createClient from "@/utils/supabase/component";
import getSortFunc, { type SortDirection } from "@/utils/getSortFunc";
import buildSupabaseQueryWithDynamicFilters, {
  type Filter,
} from "@/utils/buildSupabaseQueryWithDynamicFilters";
import getErrMsg from "@/utils/getErrMsg";

//Declare types
type Row = {
  [key: string]: any;
};

type Rows = Row[] | null;

type FetchData = () => Promise<Rows>;

interface Actions {
  sortRows(sortField: string, sortDirection: "asc" | "desc"): Promise<void>;
  refetchRows(): Promise<void>;
  deleteRow(id: any): void;
  addRow(rowForSupabase: any, optimisticRow: any): void;
  editRow(rowForSupabase: any, optimisticRow: any): void;
  runRpc(
    rpcName: string,
    dataForSupabase: any,
    optimisticData: any,
    optimisticOperation?: string
  ): void;
}

interface SupabaseProviderProps {
  className?: string;
  queryName: string;
  tableName: string;
  columns: string;
  filters?: Filter[];
  uniqueIdentifierField: string;
  hideDefaultErrors: boolean;
  children: React.ReactNode;
  loading: React.ReactNode;
  validating: React.ReactNode;
  noData: React.ReactNode;
  forceNoData: boolean;
  forceQueryError: boolean;
  forceMutationError: boolean;
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
      //All avialable props destructured
      className,
      queryName,
      tableName,
      columns,
      filters,
      uniqueIdentifierField,
      hideDefaultErrors,
      children,
      loading,
      validating,
      noData,
      forceNoData,
      forceQueryError,
      forceMutationError,
      forceLoading,
      forceValidating,
      generateRandomErrors,
      initialSortField,
      initialSortDirection,
    } = props;

    //Setup state
    const [data, setData] = useState<Rows>(null);
    const [sortedData, setSortedData] = useState<Rows>(null);
    const [sortField, setSortField] = useState<string>(initialSortField);
    const [sortDirection, setSortDirection] =
      useState<SortDirection>(initialSortDirection);

    //string version of the raw error object from SWR
    const [fetcherError, setFetcherError] = useState<string | null>(null);

    //Error resulting from a mutation as opposed to SWR fetcher
    const [mutationError, setMutationError] = useState<string | null>(null);

    //When data or sorting changes, set sortedData
    //This works better with opsimistic updates than directly sorting data in query / mutation functions
    //Because the user may change sort order partway through async query/mutation causes glitches
    //This takes care of sort automatically whenever data or sort changes, making it smooth & easy
    useEffect(() => {
      if (data) {
        const newData = [...data];
        newData.sort(getSortFunc(sortField, sortDirection));
        setSortedData(newData);
      }
    }, [data, sortField, sortDirection]);

    //Function that can be called to fetch data
    const fetchData: FetchData = useCallback(async () => {
      //New client
      const supabase = createClient();

      //Build the query with dynamic filters that were passed as props to the component
      const supabaseQuery = buildSupabaseQueryWithDynamicFilters({
        supabase,
        tableName,
        columns,
        filters,
      });

      //Execute the query
      const { data, error } = await supabaseQuery;
      if (error) {
        throw error;
      }
      return data;
    }, [tableName, columns, filters]);

    //Fetch data using SWR
    const {
      data: fetchedData,
      error: rawFetcherErr,
      mutate,
      isValidating,
    } = useSWR(`/${queryName}`, fetchData, {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    });

    //When tableName changes, refetch data
    useEffect(() => {
      mutate().catch((err) => setMutationError(getErrMsg(err)));
    }, [tableName, mutate]);

    //When data changes, set data
    //In turn this will cause change to sortedData
    useEffect(() => {
      if (fetchedData) {
        setData(fetchedData);
      }
    }, [fetchedData]);

    //When error changes from SWR, set fetcherError
    useEffect(() => {
      if (rawFetcherErr) {
        setFetcherError(getErrMsg(rawFetcherErr));
      } else {
        setFetcherError(null);
      }
    }, [rawFetcherErr]);

    //When forceQueryError changes, set fetcherEror
    useEffect(() => {
      if (forceQueryError) {
        setFetcherError("Simulated query error!");
      } else {
        setFetcherError(null);
      }
    }, [forceQueryError]);

    //When forceMutationError changes, set mutationError
    useEffect(() => {
      if (forceMutationError) {
        setMutationError("Simulated mutation error!");
      } else {
        setMutationError(null);
      }
    }, [forceMutationError]);

    /*FUNCTIONS TO HANDLE OPTIMISTIC UPDATES*/

    //Function that just returns the data unchanged
    //To pass in as an optimistic update function when no optimistic update is desired
    //Effectively disabling optimistic updates for the operation
    function returnUnchangedData(data: Rows) {
      return data;
    }

    //Function to replace entire optimistic data with new data
    const replaceDataOptimistically = useCallback((_data: Rows, optimisticData: Rows) => {
      return optimisticData;
    }, []);

    //Function for optimistic add of a row to existing data
    //Adds a new row to the end of the array
    //This will be sorted automatically by useEffect above
    const addRowOptimistically = useCallback(
      (data: Rows | null, optimisticRow: Row) => {
        const newData = [...(data || []), optimisticRow];
        return newData;
      },
      []
    );

    //Function for optimistic edit of a row in existing data
    //Replaces the row by matching uniqueIdentifierField (id)
    const editRowOptimistically = useCallback(
      (data: Rows, optimisticRow: Row) => {
        const newData =
          data?.map((existingRow) => {
            if (
              optimisticRow[uniqueIdentifierField] ===
              existingRow[uniqueIdentifierField]
            ) {
              return optimisticRow;
            }
            return existingRow;
          }) || [];
        return newData;
      },
      [uniqueIdentifierField]
    );

    //Helper function to optimistically delete a row from the data
    //optimisticData is either an object with the unique identifier field (usually 'id') present in the first level of the object
    //or a number or string (the actual value of the unique identifier field (id) to filter by)
    const deleteRowOptimistically = useCallback(
      (data: Rows, optimisticData: number | string | Row) => {
        
        //Extract the unique identifier value from the optimistic data
        //So we can filter the row out of the data based on this
        let uniqueIdentifierVal: any;

        if (typeof optimisticData === "object") {
          //If the unique identifier is an object, look for the unique identifier value in the object
          //Based on the user-specified unique identifier field
          //Eg {a: 1, id: 123} would extract 123
          uniqueIdentifierVal = optimisticData[uniqueIdentifierField];
        } else {
          //Otherwise, assume the uniqueIdentifierVal has been directly provided eg value of '123'
          uniqueIdentifierVal = optimisticData;
        }

        //If the extracted value for the unique identifier is not a number or string, throw an error
        if (
          typeof uniqueIdentifierVal !== "number" &&
          typeof uniqueIdentifierVal !== "string"
        ) {
          throw new Error(`
            Unable to optimistically delete row. The optimistic data passed was invalid so we could not extract a value for uniquely identifying the row to delete.
            Optimistic data for delete row must be a number, a string, or an object with the unique identifier field (usually 'id') present in the first level of the object.
          `);
        }

        //Filter out the row from the data based on the unique identifier value
        const newData = data?.filter(
          (row) => row[uniqueIdentifierField] !== uniqueIdentifierVal
        );
        if (!newData) return null;

        return newData;
      },
      [uniqueIdentifierField]
    );

    /*FUNCTIONS TO HANDLE SUPABASE API CALLS*/
    //All return data via optimistic function to avoid refetch in the mutation
    //because useSWR will refetch after mutation is finished anyway

    //Function to add a row in supabase
    const addRow = useCallback(
      async (
        rowForSupabase: Row,
        optimisticRow: Row,
        optimisticFunc: (data: Rows, optimisticData: any) => Rows
      ) => {
        
        //When specified, generate random errors for Plasmic studio testing
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on addRow");

        //Add the row to supabase
        const supabase = createClient();
        const { error } = await supabase.from(tableName).insert(rowForSupabase);
        if (error) throw error;
        return optimisticFunc(data, optimisticRow);
      },
      [data, generateRandomErrors, tableName]
    );

    //Function to actually update row in supabase
    const editRow = useCallback(
      async (
        rowForSupabase: Row, 
        optimisticRow: Row,
        optimisticFunc: (data: Rows, optimisticData: any) => Rows
      ) => {

        //When specified, generate random errors for Plasmic studio testing
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on editRow");

        //Update the row in supabase
        const supabase = createClient();
        const { error } = await supabase
          .from(tableName)
          .update(rowForSupabase)
          .eq(uniqueIdentifierField, rowForSupabase[uniqueIdentifierField]);
        if (error) throw error;
        return optimisticFunc(data, optimisticRow);
      },
      [
        data,
        generateRandomErrors,
        tableName,
        uniqueIdentifierField,
      ]
    );

    //Helper function to actually delete a row in Supabase
    const deleteRow = useCallback(
      async (uniqueIdentifierVal: number | string) => {

        //When specified, generate random errors for Plasmic studio testing
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on deleteRow");

        //Delete the row in supabase
        const supabase = createClient();
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(uniqueIdentifierField, uniqueIdentifierVal);
        if (error) throw error;

        return deleteRowOptimistically(data, uniqueIdentifierVal);
      },
      [
        data,
        generateRandomErrors,
        tableName,
        uniqueIdentifierField,
        deleteRowOptimistically,
      ]
    );

    //Function to run an RPC (database function) in supabase
    const rpc = useCallback(
      async (
        rpcName: string,
        dataForSupabase: any,
        optimisticData: any,
        optimisticFunc: (data: Rows, optimisticData: any) => Rows
      ) => {

        //When specified, generate random errors for Plasmic studio testing
        if (generateRandomErrors && Math.random() > 0.5)
          throw new Error("Randomly generated error on run RPC");

        //Run the RPC
        const supabase = createClient();
        //Typescript ignore next line because it's a dynamic function call that typescript doesn't know available options for
        // @ts-ignore
        const { error } = await supabase.rpc(rpcName, dataForSupabase);
        if (error) throw error;

        return optimisticFunc(data, optimisticData);
      },
      [data, generateRandomErrors]
    );

    //Helper function to choose the correct optimistic data function to run
    function chooseOptimisticFunc(
      optimisticOperation: string | null | undefined,
      elementActionName: string
    ) {
      if (optimisticOperation === "addRow") {
        return addRowOptimistically;
      } else if (optimisticOperation === "editRow") {
        return editRowOptimistically;
      } else if (optimisticOperation === "deleteRow") {
        return deleteRowOptimistically;
      } else if (optimisticOperation === "replaceData") {
        return replaceDataOptimistically;
      } else {
        //None of the above, but something was specified
        if (optimisticOperation) {
          throw new Error(`
              Invalid optimistic operation specified in "${elementActionName}" element action.
              You specified  "${optimisticOperation}" but the allowed values are "addRow", "editRow", "deleteRow", "replaceData" or left blank for no optimistic operation.
          `);
        }

        //Nothing specified, function that does not change data (ie no optimistic operation)
        return returnUnchangedData;
      }
    }

    /*Define element actions which can be called in Plasmic Studio*/
    useImperativeHandle(ref, () => ({

      //Element action to sort rows
      sortRows: async (sortField, sortDirection) => {
        setMutationError(null)
        setSortField(sortField);
        setSortDirection(sortDirection);
      },

      //Element action to refetch data from supabase
      refetchRows: async () => {
        setMutationError(null)
        mutate().catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to delete a row with optional optimistic update & auto-refetch when done
      deleteRow: async (uniqueIdentifierVal) => {
        setMutationError(null)
        mutate(deleteRow(uniqueIdentifierVal), {
          populateCache: true,
          optimisticData: deleteRowOptimistically(data, uniqueIdentifierVal),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to add a row with optional optimistic update & auto-refetch when done
      addRow: async (rowForSupabase, optimisticRow) => {
        setMutationError(null)
        //Choose the optimistic function based on whether the user has specified optimisticRow
        //No optimisticRow means the returnUnchangedData func will be used, disabling optimistic update
        let optimisticOperation = optimisticRow ? "addRow" : null;
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Add Row"
        );

        //Run the mutation
        mutate(addRow(rowForSupabase, optimisticRow, optimisticFunc), {
          populateCache: true,
          optimisticData: optimisticFunc(data, optimisticRow),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to edit a row with optional optimistic update & auto-refetch when done
      editRow: async (rowForSupabase, optimisticRow) => {
        setMutationError(null)
        //Choose the optimistic function based on whether the user has specified optimisticRow
        //No optimisticRow means the returnUnchangedData func will be used, disabling optimistic update
        let optimisticOperation = optimisticRow ? "editRow" : null;
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Edit Row"
        );

        //Run the mutation
        mutate(editRow(rowForSupabase, optimisticRow, optimisticFunc), {
          populateCache: true,
          optimisticData: optimisticFunc(data, optimisticRow),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to run a supabase RPC (database function) with optimistic operation (addRow, editRow, deleteRow, replaceData or none)
      //and auto-refetch when done
      runRpc: async (
        rpcName,
        dataForSupabase,
        optimisticData,
        optimisticOperation
      ) => {
        setMutationError(null)

        //Choose the correct optimistic function based on user's settings in the element action in studio
        const optimisticFunc = chooseOptimisticFunc(
          optimisticOperation,
          "Run RPC" //The name of the element action for error messages
        );

        //Run the operation with optimistically updated data
        //if optimisticOperation is not specified, the optimisticFunc will be returnUnchangedData, disabling optimistic update
        mutate(rpc(rpcName, dataForSupabase, optimisticData, optimisticFunc), {
          populateCache: true,
          optimisticData: optimisticFunc(data, optimisticData),
        }).catch((err) => setMutationError(getErrMsg(err)));
      },

      //Element action to Clear any mutation errors
      clearError: () => {
        setMutationError(null);
      },
    }));

    //Render the component
    return (
      <div className={className}>
        <DataProvider
          name={queryName || "SupabaseProvider"}
          data={{
            isLoading: (isValidating && !fetchedData) || forceLoading,
            isValidating: isValidating || forceValidating,
            mutationError,
            fetcherError,
            data: forceNoData ? null : sortedData,
            sort: {
              field: sortField,
              direction: sortDirection,
            },
          }}
        >
          {/*Loading state - validating before we initially have data*/}
          {((isValidating && !fetchedData) || forceLoading) && loading}

          {/*Validating state - any time we are running mutate() to revalidate cache*/}
          {(isValidating || forceValidating) && validating}

          {/*No data state*/}
          {(!data || data.length === 0 || forceNoData) && noData}

          {/*Error state - error is currently there according to SWR*/}
          {fetcherError && !hideDefaultErrors && (
            <p>Error from fetching records: {fetcherError}</p>
          )}

          {/*Error state - error is currently there according to mutation*/}
          {mutationError && !hideDefaultErrors && (
            <p>Error from mutation: {mutationError}</p>
          )}

          {/*Render children with data provider - when we have data*/}
          {(data || !tableName) && children}
        </DataProvider>
      </div>
    );
  }
);